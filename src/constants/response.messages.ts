export const USERS_MESSAGE = {
  CREATE_SUCCESS: 'User created successfully',
  UPDATE_SUCCESS: 'User updated successfully',
  DELETE_SUCCESS: 'User deleted successfully',
  GET_ALL_SUCCESS: 'Users retrieved successfully',
  GET_ONE_SUCCESS: 'User retrieved successfully',
  USERNAME_OR_EMAIL_EXISTED: 'User name or email already exists',
  USER_NOT_FOUND: 'User not found',
} as const;

export const MONGOOSE_MESSAGE = { INVALID_ID: 'Invalid id' } as const;

export const COMPANY_MESSAGE = {
  CREATE_SUCCESS: 'Company created successfully',
  UPDATE_SUCCESS: 'Company updated successfully',
  DELETE_SUCCESS: 'Company deleted successfully',
  GET_ALL_SUCCESS: 'Companies retrieved successfully',
  GET_ONE_SUCCESS: 'Company retrieved successfully',
  COMPANY_NOT_FOUND: 'Company not found',
} as const;

export const AUTH_MESSAGE = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Register successfully',
  REFRESH_TOKEN_SUCCESS: 'Refresh token successfully',
  INVALID_TOKEN: 'Invalid token',
  LOGOUT_SUCCESS: 'Log out successfully',
  GET_ACCOUNT_SUCCESS: 'Get account successfully',
} as const;

export const JOB_MESSAGE = {
  CREATE_SUCCESS: 'Job created successfully',
  UPDATE_SUCCESS: 'Job updated successfully',
  DELETE_SUCCESS: 'Job deleted successfully',
  GET_ALL_SUCCESS: 'Jobs retrieved successfully',
  GET_ONE_SUCCESS: 'Job retrieved successfully',
  JOB_NOT_FOUND: 'Job not found',
} as const;

export const UPLOAD_FILE_MESSAGE = {
  UPLOAD_SUCCESS: 'File uploaded successfully',
  FILE_NOT_FOUND: 'File not found',
} as const;

export const RESUME_MESSAGE = {
  CREATE_SUCCESS: 'Resume created successfully',
  UPDATE_SUCCESS: 'Resume updated successfully',
  DELETE_SUCCESS: 'Resume deleted successfully',
  GET_ALL_SUCCESS: 'Resumes retrieved successfully',
  GET_ONE_SUCCESS: 'Resume retrieved successfully',
  RESUME_NOT_FOUND: 'Resume not found',
} as const;
