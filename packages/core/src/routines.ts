// ─────────────────────────────────────────────────────────────
//  @furr/core — Routine Tasks domain types
// ─────────────────────────────────────────────────────────────

export type RoutineTask = {
  id: string;
  petId: string;
  ownerUid: string;
  title: string;
  time: string;
  isCompleted: boolean;
  createdAt: string;
};
