import { StringComparison } from './string-comparison.js';

export class SuffixArray {
  private readonly eoc: number = 2147483647;
  private m_str: string;
  private m_sa: Int32Array;
  private m_isa: Int32Array;
  private m_chainHeadsDict: Map<number, number>;
  private m_chainStack: Chain[] = [];
  private m_subChains: Chain[] = [];
  private m_nextRank: number = 1;

  public static create(str: string): Int32Array {
    if (str == null) {
      throw new Error('Input string cannot be null.');
    }
    const suffixArray: SuffixArray = new SuffixArray(str);
    suffixArray.FormInitialChains();
    suffixArray.BuildSufixArray();
    return suffixArray.m_sa;
  }

  private constructor(private readonly str: string) {
    const l = str.length;
    this.m_str = str;
    this.m_sa = new Int32Array(l);
    this.m_isa = new Int32Array(l);
    this.m_chainHeadsDict = new Map<number, number>();
  }

  private FormInitialChains(): void {
    this.FindInitialChains();
    this.SortAndPushSubchains();
  }

  private FindInitialChains(): void {
    for (let i = 0; i < this.m_str.length; i++) {
      const char_code = this.m_str.charCodeAt(i);
      const chain_head_index = this.m_chainHeadsDict.get(char_code);
      if (chain_head_index !== undefined) {
        this.m_isa[i] = chain_head_index;
      } else {
        this.m_isa[i] = this.eoc;
      }
      this.m_chainHeadsDict.set(char_code, i);
    }

    for (const headIndex of this.m_chainHeadsDict.values()) {
      const newChain = new Chain(this.m_str, headIndex, 1);
      this.m_subChains.push(newChain);
    }
  }

  private BuildSufixArray(): void {
    while (this.m_chainStack.length > 0) {
      const chain: Chain = this.m_chainStack.pop() as Chain;

      if (this.m_isa[chain.head] === this.eoc) {
        this.RankSuffix(chain.head);
      } else {
        this.RefineChainWithInductionSorting(chain);
      }
    }
  }

  private RankSuffix(index: number): void {
    this.m_isa[index] = -this.m_nextRank;
    this.m_sa[this.m_nextRank - 1] = index;
    this.m_nextRank++;
  }

  private RefineChainWithInductionSorting(chain: Chain): void {
    const notedSuffixes: SuffixRank[] = [];
    this.m_chainHeadsDict.clear();
    this.m_subChains = [];

    while (chain.head !== this.eoc) {
      const nextIndex: number = this.m_isa[chain.head];
      if (chain.head + chain.length > this.m_str.length - 1) {
        this.RankSuffix(chain.head);
      } else if (this.m_isa[chain.head + chain.length] < 0) {
        const sr: SuffixRank = new SuffixRank(chain.head, -this.m_isa[chain.head + chain.length]);
        notedSuffixes.push(sr);
      } else {
        this.ExtendChain(chain);
      }
      chain.head = nextIndex;
    }

    this.SortAndPushSubchains();
    this.SortAndRankNotedSuffixes(notedSuffixes);
  }

  private ExtendChain(chain: Chain): void {
    const sym: number = this.m_str.charCodeAt(chain.head + chain.length);
    if (this.m_chainHeadsDict.has(sym)) {
      this.m_isa[this.m_chainHeadsDict.get(sym) as number] = chain.head;
      this.m_isa[chain.head] = this.eoc;
    } else {
      this.m_isa[chain.head] = this.eoc;
      const newChain: Chain = new Chain(this.m_str, chain.head, chain.length + 1);
      this.m_subChains.push(newChain);
    }

    this.m_chainHeadsDict.set(sym, chain.head);
  }

  private SortAndRankNotedSuffixes(notedSuffixes: SuffixRank[]): void {
    notedSuffixes.sort((a, b) => {
      return a.rank - b.rank;
    });

    for (let i = 0; i < notedSuffixes.length; i++) {
      this.RankSuffix(notedSuffixes[i].head);
    }
  }

  private SortAndPushSubchains(): void {
    this.m_subChains.sort((c1: Chain, c2: Chain): number => {
      const len = Math.min(c1.length, c2.length);
      return StringComparison.compareOrdinal(this.m_str, c1.head, this.m_str, c2.head, len);
    });
    for (let i = this.m_subChains.length - 1; i >= 0; i--) {
      this.m_chainStack.push(this.m_subChains[i]);
    }
  }
}

class SuffixRank {
  public constructor(
    public readonly head: number,
    public readonly rank: number
  ) {}
}

class Chain {
  public readonly m_str: string;
  public head: number;
  public length: number;

  public constructor(m_str: string, head: number, length: number) {
    this.m_str = m_str;
    this.head = head;
    this.length = length;
  }
}
