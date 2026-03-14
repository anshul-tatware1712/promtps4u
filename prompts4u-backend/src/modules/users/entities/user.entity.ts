export class UserEntity {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  provider: string;
  providerId: string | null;
  subscriptionStatus: string;
  subscriptionId: string | null;
  subscriptionEnd: Date | null;
  createdAt: Date;
}
