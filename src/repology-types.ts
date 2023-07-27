export type Project = {
    repo: string;
    subrepo: string;
    srcname: string;
    visiblename: string;
    binname: string;
    version: string;
    maintainers: string[];
    categories: string[];
    origversion: string;
    status: string;
    summary: string;
    licenses: string[];
}

export type ProjectSearchResult = Record<string, Project[]>;