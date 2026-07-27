export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export async function mapLineIdentityToStoreUser(
  lineProfile: LineUserProfile,
  storeId: string
) {
  return {
    lineUserId: lineProfile.userId,
    displayName: lineProfile.displayName,
    pictureUrl: lineProfile.pictureUrl,
    mappedStoreId: storeId,
    mappedAt: new Date().toISOString(),
  };
}
