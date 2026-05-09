import { AppError, NetworkError, ApiError, handleUnknownError } from '../../src/errors/errorHandler';

describe('AppError', () => {
  it('creates error with all required fields', () => {
    const err = new AppError('code', 'User message', { detail: 'info' }, 'Urdu message');
    expect(err.code).toBe('code');
    expect(err.message).toBe('User message');
    expect(err.meta).toEqual({ detail: 'info' });
    expect(err.urduMessage).toBe('Urdu message');
  });

  it('toJSON returns correct shape', () => {
    const err = new AppError('code', 'msg', {}, 'urdu');
    expect(err.toJSON()).toEqual({ code: 'code', message: 'msg', meta: {}, urduMessage: 'urdu' });
  });
});

describe('NetworkError', () => {
  it('NetworkError.offline() has correct code', () => {
    const err = NetworkError.offline();
    expect(err.code).toBe('NETWORK_OFFLINE');
    expect(err.isOffline).toBe(true);
  });

  it('NetworkError.timeout() has isTimeout true', () => {
    const err = NetworkError.timeout();
    expect(err.isTimeout).toBe(true);
  });

  it('userMessage is user-friendly (no technical terms)', () => {
    const err = NetworkError.offline();
    expect(err.userMessage).toMatch(/offline|no connection/i);
  });
});

describe('ApiError', () => {
  it('ApiError.fromAxiosError converts 401 correctly', () => {
    const axiosErr = { response: { status: 401, data: { message: 'Unauthorized' } }, isAxiosError: true } as any;
    const err = ApiError.fromAxiosError(axiosErr);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.status).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('ApiError.fromAxiosError converts 422 with fields', () => {
    const axiosErr = { response: { status: 422, data: { errors: { email: ['invalid'] } } }, isAxiosError: true } as any;
    const err = ApiError.fromAxiosError(axiosErr);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.meta).toEqual({ errors: { email: ['invalid'] } });
  });

  it('ApiError.validationFailed extracts field errors', () => {
    const err = new ApiError('VALIDATION_ERROR', 'Validation failed', { errors: { phone: ['required'] } }, 422);
    const fields = err.validationFailed();
    expect(fields).toEqual({ phone: ['required'] });
  });
});

describe('handleUnknownError', () => {
  it('returns AppError unchanged', () => {
    const appErr = new AppError('E', 'msg', {}, 'urdu');
    expect(handleUnknownError(appErr)).toBe(appErr);
  });

  it('converts plain Error to AppError', () => {
    const err = new Error('boom');
    const appErr = handleUnknownError(err);
    expect(appErr).toBeInstanceOf(AppError);
    expect(appErr.message).toBe('boom');
  });

  it('converts string to AppError', () => {
    const appErr = handleUnknownError('oops');
    expect(appErr).toBeInstanceOf(AppError);
    expect(appErr.message).toBe('oops');
  });

  it('converts axios error to ApiError', () => {
    const axiosErr = { response: { status: 404, data: { message: 'Not found' } }, isAxiosError: true } as any;
    const apiErr = handleUnknownError(axiosErr);
    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.status).toBe(404);
  });

  it('never throws — always returns AppError', () => {
    const result = handleUnknownError(undefined as any);
    expect(result).toBeInstanceOf(AppError);
  });
});
