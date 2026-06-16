import { accountRepo } from "./account.repo";

export const accountService = {
  deleteAccount: async (userId: string): Promise<void> => {
    await accountRepo.deleteByUserId(userId);
  },
};
