import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API version', () => {
      expect(appController.getRoot()).toBe({ message: 'XBorg API v1.0' });
    });

    it('should return the health status', () => {
      expect(appController.getHealth()).toBe({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    });
  });
});
