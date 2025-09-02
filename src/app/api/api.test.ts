import axios from 'axios';

describe('API Routes', () => {
  const baseUrl = 'http://localhost:3000/api';
  let userId: string;
  let assinaturaId: string;

  it('should register a user and generate keys', async () => {
    const res = await axios.post(`${baseUrl}/register`, {
      email: 'test@example.com',
      password: '123456',
    });
    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    userId = res.data.id;
  });

  it('should sign a message', async () => {
    const res = await axios.post(`${baseUrl}/sign`, {
      userId,
      content: 'Mensagem para assinar',
    });
    expect(res.status).toBe(201);
    expect(res.data.id).toBeDefined();
    assinaturaId = res.data.id;
  });

  it('should verify a signature and return VÁLIDA', async () => {
    const res = await axios.get(`${baseUrl}/verify`, {
      params: { id: assinaturaId },
    });
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('VÁLIDA');
    expect(res.data.signatario).toBeDefined();
    expect(res.data.algoritmo).toBeDefined();
    expect(res.data.timestamp).toBeDefined();
  });

  it('should return INVÁLIDA for wrong signature', async () => {
    const res = await axios.get(`${baseUrl}/verify`, {
      params: { id: 'invalid_id' },
    });
    expect(res.status).toBe(404);
    expect(res.data.error).toBeDefined();
  });
});
