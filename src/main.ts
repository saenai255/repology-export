import Axios from "axios";
import { Project, ProjectSearchResult } from "./repology-types";
import { createTablesIfNotExists as createOrResetTables, db } from "./database";
import { NewProjectProvider } from "./database-types";
import { loadConfig } from "./config";

const getProjectSearchResults = async (projectName: string, userAgent: string): Promise<ProjectSearchResult> => {
    const response = await Axios.get<ProjectSearchResult>(`https://repology.org/api/v1/projects/${projectName}`, {
        headers: {
            'User-Agent': userAgent,
        }
    });
     
    return response.data;
}

const mapProjectSearchResultToNewProjectProvider = (projectName: string, result: Project): NewProjectProvider => {
    return {
        project_name: projectName,
        repository: result.repo,
        sub_repository: result.subrepo,
        source_name: result.srcname,
        visible_name: result.visiblename,
        binary_name: result.binname,
        version: result.version,
        original_version: result.origversion,
        status: result.status,
        summary: result.summary,
    }
}

// SQLite has a limit of 999 variables per query
const VARIABLES_PER_QUERY = 10;
const SQLITE_VARIABLES_LIMIT = 999;
const MAX_PROVIDERS_PER_QUERY = Math.floor(SQLITE_VARIABLES_LIMIT / VARIABLES_PER_QUERY);

const saveProjectSearchResults = async (results: ProjectSearchResult) => {
    for (const [projectName, providers] of Object.entries(results)) {
        await db.replaceInto('project')
            .values({ name: projectName })
            .execute();

        const batchesNo = Math.ceil(providers.length / MAX_PROVIDERS_PER_QUERY);
        for (let i = 0; i < batchesNo; i++) {
            const batch = providers.slice(i * MAX_PROVIDERS_PER_QUERY, (i + 1) * MAX_PROVIDERS_PER_QUERY);
            await db.replaceInto('project_provider')
                .values(batch.map(result => mapProjectSearchResultToNewProjectProvider(projectName, result)))
                .execute();
        }
    }
}

const leftPad = (str: string, length: number, padChar: string = ' ') => {
    return padChar.repeat(length - str.length) + str;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const config = await loadConfig();
    await createOrResetTables();

    let lastProjectName = '';
    for (let i = 1; true; i++) {
        const apiThrottleDelay = delay(config.requestDelayMs);

        if (config.verbose) {
            const currentTime = new Date().toISOString().split('T').pop()?.split('.')[0];
            const currentIteration = leftPad(i.toString(), 4, ' ');
            const totalResultsNo = leftPad((i * 200).toString(), 6, ' ');
            console.log(`${currentTime} | Iteration ${currentIteration} | Found a total of ${totalResultsNo} results | Cursor at: ${lastProjectName || 'N/A'}`);
        }

        const results = await getProjectSearchResults(lastProjectName.split('/').pop()!, config.userAgent);
        
        const projectsNo = Object.keys(results).length;
        if (projectsNo === 1) {
            console.log(`No more results.`);
            break;
        }

        lastProjectName = Object.keys(results).sort().reverse()[0];
        if (!lastProjectName) {
            console.log(`Failed to search for the next page.`);
            break;
        }

        await Promise.all([
            saveProjectSearchResults(results),
            apiThrottleDelay
        ]);
    }
}

main()
    .finally(() => db.destroy());

process.on('SIGINT', async () => {
    console.log('\nCaught interrupt signal. Closing the database connection gracefully...');
    await db.destroy();
    console.log('Done. Exiting...')
    process.exit();
});
