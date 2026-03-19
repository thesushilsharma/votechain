// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Minimal governance contract to support:
 * - Weighted voting and quadratic voting
 * - Delegation (vote by proxy) via `voteFor`
 * - Multi-choice ballots
 * - Proposal lifecycle: Draft -> Active -> Ended -> Archived
 *
 * Notes:
 * - Quadratic voting uses sqrt(rawWeight).
 * - Delegation is modeled as: delegatee can call `voteFor` for a delegator.
 * - This contract doesn't integrate token balances; callers provide `rawWeight` off-chain.
 */
contract VoteChainGovernance {
    enum ProposalStatus {
        Draft,
        Active,
        Ended,
        Archived
    }

    enum VotingMode {
        Weighted,
        Quadratic
    }

    struct Proposal {
        address creator;
        uint64 startTime;
        uint64 endTime;
        uint8 choicesCount;
        ProposalStatus status;
    }

    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;

    // proposalId => choiceIndex => effectiveVotes
    mapping(uint256 => mapping(uint8 => uint256)) public choiceVotes;

    // proposalId => delegator => voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // proposalId => delegator => delegatee allowed to voteFor( delegator )
    mapping(uint256 => mapping(address => address)) public delegates;

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        uint64 startTime,
        uint64 endTime,
        uint8 choicesCount
    );
    event ProposalActivated(uint256 indexed proposalId);
    event Delegated(uint256 indexed proposalId, address indexed delegator, address indexed delegatee);
    event Voted(
        uint256 indexed proposalId,
        address indexed msgSender,
        address indexed delegator,
        uint8 choiceIndex,
        uint256 rawWeight,
        VotingMode mode,
        uint256 effectiveWeight
    );
    event ProposalFinalized(uint256 indexed proposalId);
    event ProposalArchived(uint256 indexed proposalId);

    function createProposal(
        uint64 startTime,
        uint64 endTime,
        uint8 choicesCount
    ) external returns (uint256 proposalId) {
        require(endTime > startTime, "bad time");
        require(choicesCount > 1, "need choices");

        proposalId = nextProposalId++;
        proposals[proposalId] = Proposal({
            creator: msg.sender,
            startTime: startTime,
            endTime: endTime,
            choicesCount: choicesCount,
            status: ProposalStatus.Draft
        });

        emit ProposalCreated(proposalId, msg.sender, startTime, endTime, choicesCount);
    }

    function activateProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(msg.sender == p.creator, "not creator");
        require(p.status == ProposalStatus.Draft, "not draft");
        require(block.timestamp < p.startTime, "already started");

        p.status = ProposalStatus.Active;
        emit ProposalActivated(proposalId);
    }

    function delegate(uint256 proposalId, address delegatee) external {
        require(delegatee != address(0), "zero delegatee");

        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active, "not active");
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "out of voting window");

        delegates[proposalId][msg.sender] = delegatee;
        emit Delegated(proposalId, msg.sender, delegatee);
    }

    function vote(
        uint256 proposalId,
        uint8 choiceIndex,
        uint256 rawWeight,
        VotingMode mode
    ) external {
        voteFor(proposalId, msg.sender, choiceIndex, rawWeight, mode);
    }

    /**
     * Delegatee can vote on behalf of a delegator.
     * If delegator didn't call `delegate`, they must vote for themselves (msg.sender == delegator).
     */
    function voteFor(
        uint256 proposalId,
        address delegator,
        uint8 choiceIndex,
        uint256 rawWeight,
        VotingMode mode
    ) public {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active, "not active");
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "out of voting window");
        require(choiceIndex < p.choicesCount, "bad choice");
        require(!hasVoted[proposalId][delegator], "already voted");

        address delegatee = delegates[proposalId][delegator];
        require(msg.sender == delegator || msg.sender == delegatee, "not allowed");

        hasVoted[proposalId][delegator] = true;
        uint256 effectiveWeight = _effectiveWeight(rawWeight, mode);
        choiceVotes[proposalId][choiceIndex] += effectiveWeight;

        emit Voted(proposalId, msg.sender, delegator, choiceIndex, rawWeight, mode, effectiveWeight);
    }

    function finalizeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active, "not active");
        require(block.timestamp > p.endTime, "still voting");

        p.status = ProposalStatus.Ended;
        emit ProposalFinalized(proposalId);
    }

    function archiveProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Ended, "not ended");

        p.status = ProposalStatus.Archived;
        emit ProposalArchived(proposalId);
    }

    function _effectiveWeight(uint256 rawWeight, VotingMode mode) internal pure returns (uint256) {
        if (mode == VotingMode.Weighted) return rawWeight;
        return _sqrt(rawWeight);
    }

    // Babylonian method
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }
}

