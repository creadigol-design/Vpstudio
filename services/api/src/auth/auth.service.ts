import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma.service";

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { memberships: { include: { organisation: { select: { id: true, name: true, slug: true } } } } },
    });
    // Same error for unknown user and wrong password (spec §29 brute-force posture).
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException({ error: "INVALID_CREDENTIALS" });
    }
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: { id: user.id, email: user.email, displayName: user.displayName, locale: user.locale },
      memberships: user.memberships.map((m) => ({
        organisationId: m.organisationId,
        organisationName: m.organisation.name,
        role: m.role,
      })),
    };
  }
}
