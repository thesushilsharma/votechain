import { encodeFunctionData, type Hex } from "viem";
import { VOTECHAIN_GOVERNANCE_ABI } from "@/lib/VoteChainGovernance.abi";

type VotingMode = "Weighted" | "Quadratic";

function modeToUint(mode: VotingMode): 0 | 1 {
  return mode === "Quadratic" ? 1 : 0;
}

function toUint64(value: number | bigint): bigint {
  return typeof value === "bigint" ? value : BigInt(Math.floor(value));
}

export type SendUserOperationLike = (options: {
  evmSmartAccount: `0x${string}`;
  network: string;
  calls: Array<{
    to: `0x${string}`;
    value: bigint;
    data: Hex;
  }>;
  useCdpPaymaster?: boolean;
}) => Promise<{
  userOperationHash?: Hex;
  transactionHash?: Hex;
}>;

export async function sendCreateProposalViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string; // default base-sepolia
  contractAddress: `0x${string}`;
  startTime: number | bigint; // unix seconds
  endTime: number | bigint; // unix seconds
  choicesCount: number; // uint8
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "createProposal",
    args: [toUint64(args.startTime), toUint64(args.endTime), BigInt(args.choicesCount)],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [
      {
        to: args.contractAddress,
        value: 0n,
        data,
      },
    ],
  });
}

export async function sendActivateProposalViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "activateProposal",
    args: [BigInt(args.proposalId)],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [{ to: args.contractAddress, value: 0n, data }],
  });
}

export async function sendDelegateViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
  delegatee: `0x${string}`;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "delegate",
    args: [BigInt(args.proposalId), args.delegatee],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [
      {
        to: args.contractAddress,
        value: 0n,
        data,
      },
    ],
  });
}

export async function sendVoteViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
  choiceIndex: number; // uint8
  rawWeight: bigint;
  mode: VotingMode;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "vote",
    args: [
      BigInt(args.proposalId),
      BigInt(args.choiceIndex),
      args.rawWeight,
      modeToUint(args.mode),
    ],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [
      {
        to: args.contractAddress,
        value: 0n,
        data,
      },
    ],
  });
}

export async function sendVoteForViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
  delegator: `0x${string}`; // vote attributed to this address
  choiceIndex: number; // uint8
  rawWeight: bigint;
  mode: VotingMode;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "voteFor",
    args: [
      BigInt(args.proposalId),
      args.delegator,
      BigInt(args.choiceIndex),
      args.rawWeight,
      modeToUint(args.mode),
    ],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [
      {
        to: args.contractAddress,
        value: 0n,
        data,
      },
    ],
  });
}

export async function sendFinalizeProposalViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "finalizeProposal",
    args: [BigInt(args.proposalId)],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [{ to: args.contractAddress, value: 0n, data }],
  });
}

export async function sendArchiveProposalViaCdpSmartAccount(args: {
  sendUserOperation: SendUserOperationLike;
  smartAccount: `0x${string}`;
  network?: string;
  contractAddress: `0x${string}`;
  proposalId: number | bigint;
}) {
  const data = encodeFunctionData({
    abi: VOTECHAIN_GOVERNANCE_ABI,
    functionName: "archiveProposal",
    args: [BigInt(args.proposalId)],
  });

  return args.sendUserOperation({
    evmSmartAccount: args.smartAccount,
    network: args.network ?? "base-sepolia",
    useCdpPaymaster: true,
    calls: [{ to: args.contractAddress, value: 0n, data }],
  });
}

