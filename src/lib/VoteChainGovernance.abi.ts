import type { Abi } from "viem";

export const VOTECHAIN_GOVERNANCE_ABI = [
  {
    inputs: [
      { name: "startTime", type: "uint64" },
      { name: "endTime", type: "uint64" },
      { name: "choicesCount", type: "uint8" },
    ],
    name: "createProposal",
    outputs: [{ name: "proposalId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "activateProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "delegatee", type: "address" },
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "choiceIndex", type: "uint8" },
      { name: "rawWeight", type: "uint256" },
      { name: "mode", type: "uint8" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "delegator", type: "address" },
      { name: "choiceIndex", type: "uint8" },
      { name: "rawWeight", type: "uint256" },
      { name: "mode", type: "uint8" },
    ],
    name: "voteFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "finalizeProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "archiveProposal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      {
        components: [
          { name: "creator", type: "address" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "choicesCount", type: "uint8" },
          { name: "status", type: "uint8" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;

