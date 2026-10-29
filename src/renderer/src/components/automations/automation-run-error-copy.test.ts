import { afterEach, describe, expect, it } from 'vitest'
import { i18n } from '@/i18n/i18n'
import es from '@/i18n/locales/es.json'
import { automationRunFailure } from '../../../../shared/automation-run-failure-copy'
import { automationRunErrorText } from './automation-run-error-copy'

const originalLanguage = i18n.language

afterEach(async () => {
  await i18n.changeLanguage(originalLanguage)
})

describe('automationRunErrorText', () => {
  it('localizes coded run failures, including one sentence per setup state', async () => {
    i18n.addResourceBundle('es', 'translation', es)
    await i18n.changeLanguage('es')
    expect(automationRunErrorText(automationRunFailure('noDispatchHost'))).toBe(
      es.automations.runFailures.noDispatchHost
    )
    expect(
      automationRunErrorText(
        automationRunFailure('projectSetupNotReady', { setupState: 'setting-up' })
      )
    ).toBe(es.automations.runFailures.projectSetupState.settingUp)
  })

  it("names the stopped WSL distro in its run's failure", () => {
    expect(
      automationRunErrorText(automationRunFailure('wslDistroStopped', { distro: 'Ubuntu' }))
    ).toBe(
      'The WSL distro Ubuntu is stopped, so this scheduled run did not start it. Start the distro or use Run now; later runs go ahead while it runs.'
    )
    // Without its distro the record keeps the stored English.
    expect(
      automationRunErrorText({ error: 'Stored', errorCode: 'wslDistroStopped', errorParams: {} })
    ).toBe('Stored')
  })

  it('shows the stored English for uncoded, unknown, or unusable failures', async () => {
    i18n.addResourceBundle('es', 'translation', es)
    await i18n.changeLanguage('es')
    expect(automationRunErrorText({ error: 'Old record text' })).toBe('Old record text')
    expect(automationRunErrorText({ error: 'Newer host', errorCode: 'futureCode' })).toBe(
      'Newer host'
    )
    expect(automationRunErrorText({ error: 'English', errorCode: 'toString' })).toBe('English')
    expect(
      automationRunErrorText({
        error: 'Project setup on the selected automation host is paused.',
        errorCode: 'projectSetupNotReady',
        errorParams: { setupState: 'paused' }
      })
    ).toBe('Project setup on the selected automation host is paused.')
    expect(automationRunErrorText({ error: null, errorCode: 'noDispatchHost' })).toBeNull()
  })
})
