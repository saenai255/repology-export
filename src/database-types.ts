import { Generated, Insertable, Selectable } from 'kysely';

export interface Database {
    project: ProjectTable;
    project_provider: ProjectProviderTable;
}

export interface ProjectTable {
    name: string;
}

export type Project = Selectable<ProjectTable>;
export type NewProject = Insertable<ProjectTable>;

export interface ProjectProviderTable {
    id: Generated<number>;
    project_name: string;
    repository: string;
    sub_repository: string | null;
    source_name: string | null;
    visible_name: string | null;
    binary_name: string | null;
    version: string;
    original_version: string | null;
    status: string | null;
    summary: string | null;
}

export type ProjectProvider = Selectable<ProjectProviderTable>;
export type NewProjectProvider = Insertable<ProjectProviderTable>;