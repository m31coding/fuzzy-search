/**
 * Original: https://github.com/eranmeir/Sufa-Suffix-Array-Csharp
 * Copyright (c) 2012 Eran Meir
 * SPDX-License-Identifier: MIT
 *
 * Translation to TypeScript, modifications and refactoring
 * (c) 2025 Kevin Schaal
 */

import { StringComparison } from './string-comparison.js';

/**
 * Creates a suffix array for a given string.
 */
export class SuffixArray {
  /**
   * The end-of-chain marker.
   */
  private readonly eoc: number = 2147483647;

  /**
   * The suffix array.
   */
  private sa: Int32Array;

  /**
   * The inverse suffix array.
   */
  private isa: Int32Array;

  /**
   * The chain heads dictionary.
   */
  private chainHeadsDict: Map<number, number>;

  /**
   * The chain stack.
   */
  private chainStack: Chain[] = [];

  /**
   * The sub-chains.
   */
  private subChains: Chain[] = [];

  /**
   * The next rank to assign.
   */
  private nextRank: number = 1;

  /**
   * Creates the suffix array for the given string.
   * @param str The input string.
   * @returns The suffix array.
   */
  public static create(str: string): Int32Array {
    if (str == null) {
      throw new Error('Input string cannot be null.');
    }
    const suffixArray: SuffixArray = new SuffixArray(str);
    suffixArray.FormInitialChains();
    suffixArray.BuildSufixArray();
    return suffixArray.sa;
  }

  /**
   * Creates a new instance of the SuffixArray class.
   * @param inputString The input string.
   */
  private constructor(private readonly inputString: string) {
    const length = inputString.length;
    this.sa = new Int32Array(length);
    this.isa = new Int32Array(length);
    this.chainHeadsDict = new Map<number, number>();
  }

  /**
   * Forms the initial chains.
   */
  private FormInitialChains(): void {
    this.FindInitialChains();
    this.SortAndPushSubchains();
  }

  /**
   * Finds the initial chains.
   */
  private FindInitialChains(): void {
    for (let i = 0; i < this.inputString.length; i++) {
      const char_code = this.inputString.charCodeAt(i);
      const chain_head_index = this.chainHeadsDict.get(char_code);
      if (chain_head_index !== undefined) {
        this.isa[i] = chain_head_index;
      } else {
        this.isa[i] = this.eoc;
      }
      this.chainHeadsDict.set(char_code, i);
    }

    for (const headIndex of this.chainHeadsDict.values()) {
      const newChain = new Chain(headIndex, 1);
      this.subChains.push(newChain);
    }
  }

  /**
   * Builds the suffix array.
   */
  private BuildSufixArray(): void {
    while (this.chainStack.length > 0) {
      const chain: Chain = this.chainStack.pop() as Chain;

      if (this.isa[chain.head] === this.eoc) {
        this.RankSuffix(chain.head);
      } else {
        this.RefineChainWithInductionSorting(chain);
      }
    }
  }

  /**
   * Ranks the suffix at the given index.
   * @param index The index of the suffix to rank.
   */
  private RankSuffix(index: number): void {
    this.isa[index] = -this.nextRank;
    this.sa[this.nextRank - 1] = index;
    this.nextRank++;
  }

  /**
   * Refines the given chain with induction sorting.
   * @param chain The chain to refine.
   */
  private RefineChainWithInductionSorting(chain: Chain): void {
    const notedSuffixes: SuffixRank[] = [];
    this.chainHeadsDict.clear();
    this.subChains = [];

    while (chain.head !== this.eoc) {
      const nextIndex: number = this.isa[chain.head];
      if (chain.head + chain.length > this.inputString.length - 1) {
        this.RankSuffix(chain.head);
      } else if (this.isa[chain.head + chain.length] < 0) {
        const sr: SuffixRank = new SuffixRank(chain.head, -this.isa[chain.head + chain.length]);
        notedSuffixes.push(sr);
      } else {
        this.ExtendChain(chain);
      }
      chain.head = nextIndex;
    }

    this.SortAndPushSubchains();
    this.SortAndRankNotedSuffixes(notedSuffixes);
  }

  /**
   * Extends the given chain.
   * @param chain The chain to extend.
   */
  private ExtendChain(chain: Chain): void {
    const sym: number = this.inputString.charCodeAt(chain.head + chain.length);
    if (this.chainHeadsDict.has(sym)) {
      this.isa[this.chainHeadsDict.get(sym) as number] = chain.head;
      this.isa[chain.head] = this.eoc;
    } else {
      this.isa[chain.head] = this.eoc;
      const newChain: Chain = new Chain(chain.head, chain.length + 1);
      this.subChains.push(newChain);
    }

    this.chainHeadsDict.set(sym, chain.head);
  }

  /**
   * Sorts and ranks the noted suffixes.
   * @param notedSuffixes The noted suffixes to sort and rank.
   */
  private SortAndRankNotedSuffixes(notedSuffixes: SuffixRank[]): void {
    notedSuffixes.sort((a, b) => {
      return a.rank - b.rank;
    });

    for (let i = 0; i < notedSuffixes.length; i++) {
      this.RankSuffix(notedSuffixes[i].head);
    }
  }

  /**
   * Sorts and pushes the sub-chains onto the chain stack.
   */
  private SortAndPushSubchains(): void {
    this.subChains.sort((c1: Chain, c2: Chain): number => {
      const len = Math.min(c1.length, c2.length);
      return StringComparison.compareOrdinal(this.inputString, c1.head, this.inputString, c2.head, len);
    });
    for (let i = this.subChains.length - 1; i >= 0; i--) {
      this.chainStack.push(this.subChains[i]);
    }
  }
}

/**
 * Represents a suffix and its rank.
 */
class SuffixRank {
  /**
   * Creates a new instance of the SuffixRank class.
   * @param head The head index of the suffix.
   * @param rank The rank of the suffix.
   */
  public constructor(
    public readonly head: number,
    public readonly rank: number
  ) {}
}

/**
 * Represents a chain of suffixes.
 */
class Chain {
  /**
   * Creates a new instance of the Chain class.
   * @param head The head index of the chain.
   * @param length The length of the chain.
   */
  public constructor(
    public head: number,
    public readonly length: number
  ) {}
}
