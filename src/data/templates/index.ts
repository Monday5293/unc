import type { FormTemplate } from '@/types/card'
import { cocTemplate } from './coc-template'
import { dndTemplate } from './dnd-template'
import { daggerheartTemplate } from './daggerheart-template'

export const formTemplates: FormTemplate[] = [
  cocTemplate,
  dndTemplate,
  daggerheartTemplate,
]

export function getTemplateBySystem(system: FormTemplate['system']): FormTemplate {
  return (
    formTemplates.find((t) => t.system === system) ?? cocTemplate
  )
}
