/**
 * Counts of the generated queries.
 */
export class QueryCounts {

    /**
     * The number of generated prefix queries.
     */
    public prefixQueries: number = 0;

    /**
     * The number of generated substring queries.
     */
    public substringQueries: number = 0;

    /**
     * The number of queries that included a transposition error.
     */
    public transpositionErrors: number = 0;

    /**
     * Creates a new instance of the QueryCounts class.
     */
    public constructor() { }
}