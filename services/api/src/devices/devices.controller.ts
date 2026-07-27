import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import {
  CreateDeviceSchema,
  DevicesService,
  HeartbeatSchema,
  type CreateDeviceDto,
  type HeartbeatDto,
} from "./devices.service";
import { RequirePermission } from "../tenancy/permissions.decorator";
import { Tenant } from "../tenancy/tenant.decorator";
import type { TenantContext } from "../tenancy/tenant.guard";
import { ZodValidationPipe } from "../zod-validation.pipe";

@Controller("devices")
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Get()
  @RequirePermission("device:manage")
  list(@Tenant() tenant: TenantContext) {
    return this.devices.list(tenant);
  }

  @Get(":id")
  @RequirePermission("device:manage")
  get(@Tenant() tenant: TenantContext, @Param("id") id: string) {
    return this.devices.get(tenant, id);
  }

  @Post()
  @RequirePermission("device:manage")
  create(@Tenant() tenant: TenantContext, @Body(new ZodValidationPipe(CreateDeviceSchema)) body: CreateDeviceDto) {
    return this.devices.create(tenant, body);
  }

  /** Called by the capture agent; authenticated by registration key. */
  @Post("heartbeat")
  @HttpCode(200)
  heartbeat(@Body(new ZodValidationPipe(HeartbeatSchema)) body: HeartbeatDto) {
    return this.devices.heartbeat(body);
  }
}
