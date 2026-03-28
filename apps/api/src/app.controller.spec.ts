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
      expect(appController.getRoot()).toEqual({ message: 'API v1.0' });
    });

    it('should return the health status', () => {
      const health = appController.getHealth();
      expect(health).toEqual(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
