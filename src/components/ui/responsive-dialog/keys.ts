import type { InjectionKey, Ref } from 'vue'

export const RESPONSIVE_DIALOG_KEY: InjectionKey<Ref<boolean>> = Symbol('responsive-dialog-mobile')
