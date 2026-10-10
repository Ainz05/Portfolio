export interface SkillColumn {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface SkillsContent {
  readonly id: string;
  readonly title: string;
  readonly columns: readonly SkillColumn[];
  readonly closing: string;
}
