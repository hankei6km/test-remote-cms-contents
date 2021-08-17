#!/usr/bin/env node
import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';
import cli from './cli';
import { ApiNameArticle, ApiNameArticleValues } from './types/apiName';

(async () => {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('count')
    .command(
      'save <outdir>',
      'save remote contents to local directory',
      (yargs) => {
        return yargs
          .positional('outdir', {
            describe: 'output directory',
            type: 'string'
          })
          .demandOption(['outdir']);
      }
    )
    .options({
      apiName: {
        choice: ApiNameArticleValues,
        required: true,
        description: 'API name to API endpoint'
      },
      apiBaseURL: {
        type: 'string',
        required: true,
        description: 'Base URL to API endpoint'
      },
      getApiKey: {
        type: 'string',
        require: true,
        description: 'API key to get contents'
      }
    })
    .help().argv;
  process.exit(
    await cli({
      stdout: process.stdout,
      stderr: process.stderr,
      outDir: argv.outdir,
      apiName: argv.apiName as ApiNameArticle,
      baseURL: argv.apiBaseURL,
      getApiKey: argv.getApiKey
    })
  );
})();
