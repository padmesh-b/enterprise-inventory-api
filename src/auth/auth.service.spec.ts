import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      company: {
        upsert: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email is already taken', async () => {
      prismaService.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'John Doe',
          companyName: 'Acme Corp',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register a user and return an access token', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.company.upsert.mockResolvedValue({
        id: 'company-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
      });
      prismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@example.com',
        name: 'Jane Doe',
        role: 'ADMIN',
        companyId: 'company-1',
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'Jane Doe',
        companyName: 'Acme Corp',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('new@example.com');
      expect(result.user.role).toBe('ADMIN');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
