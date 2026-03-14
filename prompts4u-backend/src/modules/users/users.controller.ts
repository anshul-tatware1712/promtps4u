import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('subscription')
  async getSubscription(@Req() req) {
    return this.usersService.getSubscriptionStatus(req.user.userId);
  }

  @Post('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateUserDto);
  }

  @Post('subscription')
  async updateSubscription(@Req() req, @Body() updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.usersService.updateSubscription(req.user.userId, updateSubscriptionDto);
  }
}
