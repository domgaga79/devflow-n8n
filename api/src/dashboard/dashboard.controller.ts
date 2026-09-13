import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Retorna os indicadores gerais do DevFlow',
  })
  async summary() {
    return this.dashboardService.summary();
  }
}