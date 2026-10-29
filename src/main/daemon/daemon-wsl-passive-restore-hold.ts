import { readWslDistroRunningState } from '../wsl-background-distro-gate'
import { wslDistroStoppedHoldMessage } from '../../shared/wsl-distro-stopped-hold'
import type { PtySpawnOptions } from '../providers/pty-provider-contract'

/**
 * Launch restore, a reload, a remount or main's background start (orchestration, automations,
 * recovery) the user did not ask for would start a stopped distro's `wsl.exe` (E9). It starts
 * only when a settled read proves the distro running; a stopped or unanswered read holds it
 * until the user's Start.
 */
export async function holdPassiveRestoreOfStoppedWslDistro(
  opts: Pick<
    PtySpawnOptions,
    'wslPassiveRestore' | 'wslBackgroundStart' | 'sessionId' | 'isNewSession' | 'attachOnly'
  >,
  wslDistro: string | undefined
): Promise<void> {
  const passiveRestore =
    opts.wslPassiveRestore === true && Boolean(opts.sessionId) && opts.isNewSession !== true
  // Background work holds fresh starts too: a new session's `wsl.exe` starts the distro as well.
  if (!wslDistro || opts.attachOnly === true || !(passiveRestore || opts.wslBackgroundStart)) {
    return
  }
  if ((await readWslDistroRunningState(wslDistro, { retryUnverifiable: true })) !== 'running') {
    throw new Error(wslDistroStoppedHoldMessage(wslDistro))
  }
}
