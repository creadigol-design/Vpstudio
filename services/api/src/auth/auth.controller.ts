import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { ZodValidationPipe } from "../zod-validation.pipe";

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type SignInDto = z.infer<typeof SignInSchema>;

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("sign-in")
  @HttpCode(200)
  signIn(@Body(new ZodValidationPipe(SignInSchema)) body: SignInDto) {
    return this.auth.signIn(body.email, body.password);
  }
}
