import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { OrganisationsModule } from "./organisations/organisations.module";
import { ProjectsModule } from "./projects/projects.module";
import { TemplatesModule } from "./templates/templates.module";
import { DevicesModule } from "./devices/devices.module";
import { UploadsModule } from "./uploads/uploads.module";
import { RecordingModule } from "./recording/recording.module";
import { RendersModule } from "./renders/renders.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    AuthModule,
    OrganisationsModule,
    ProjectsModule,
    TemplatesModule,
    DevicesModule,
    UploadsModule,
    RecordingModule,
    RendersModule,
    ReviewsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
