import { Command } from 'commander'

import { MENU_NO } from '@/constants'
import * as formatters from '@/formatters'
import { handleError } from '@/shared/utils/error-handler'
import { formatOutput } from '@/shared/utils/output'

import { getHttpOrExit } from './helpers'

type ShowOptions = { pretty?: boolean }

async function showAction(options: ShowOptions): Promise<void> {
  try {
    const http = await getHttpOrExit()
    const html = await http.get('/mypage/myMain/dashboard.do', { menuNo: MENU_NO.DASHBOARD })
    console.log(formatOutput(formatters.parseDashboard(html), options.pretty))
  } catch (error) {
    handleError(error)
  }
}

export const dashboardCommand = new Command('dashboard')
  .description('Show dashboard information')
  .addCommand(
    new Command('show').description('Show dashboard').option('--pretty', 'Pretty print JSON output').action(showAction),
  )
