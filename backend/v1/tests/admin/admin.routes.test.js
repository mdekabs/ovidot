import request from 'supertest';
import { expect } from 'chai';
import app from '../../../app.js';
import sinon from 'sinon';
import dotenv from 'dotenv';
import User from '../../models/user.model.js';
import Cycle from '../../models/cycle.model.js';
dotenv.config();

const { SUPERADMIN, ADMINPASS } = process.env;
const { SUPER_ADMIN_TOKEN, SUB_ADMIN_TOKEN } = process.env; 

describe('ADMIN AUTHENTICATION', () => {
  it('should return 200 when an admin logins', async () => {
    const res = await request(app)
    .post('/api/v1/admin/login')
    .send({ username: SUPERADMIN, password: ADMINPASS });
    
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Authentication successful');
    expect(res.body).to.have.property('token');
  });

  it.skip('should log out the admin with 200 status code', async () => {
    const res = await request(app)
      .get('/api/v1/admin/logout')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(200);
  });
});


describe('ADMIN USER ROUTES', () => {
  // GET /users - Get all the users
  it('should fetch all users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body.allUsers.length).to.be.lessThan(13);
    expect(res.body.links).to.exist;
  });

  // POST /users/email - Get a specific user data by email
  it('should fetch a user by email but returns 400 when no data is passed', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({});

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Fill required properties');
  });

  it('should return 404 when no user is found by email', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'icantfind@oops.com' });

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'User with icantfind@oops.com not found');
  });

  it('should return 200 when user is found by email', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'emmanueleyang@gmail.com' });

    expect(res.statusCode).to.equal(200);
  });

  // POST /users/email/cycles - Get all cycles for a given email
  it('should 400 when the email is not passed', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email/cycles')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({});
    
    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Fill required properties');
  });

  it('should return 404 when no user is found', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email/cycles')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'icantfind@oops.com' });

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'User with icantfind@oops.com not found');
  });

  it('should return 200 and cyles related to the email', async () => {
    const res = await request(app)
      .post('/api/v1/admin/users/email/cycles')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'emmanueleyang@gmail.com' });
    
    expect(res.statusCode).to.equal(200);
    expect(res.body.allCycles.length).to.be.lessThan(13);
    expect(res.body.links).to.exist;
  });

  // PUT /users/email - Update user email
  it('should return 400 when no data is provided', async () => {
    const res = await request(app)
      .put('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({});
    
    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Fill required properties');
  });

  it('should return 404 when wrong email is passed', async () => {
    const res = await request(app)
      .put('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ oldEmail: 'icantfind@oops.com',
        newEmail: 'daniel.eyang@ovidot.com' });
    
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'User with icantfind@oops.com not found');
  });

  it('should return 200 when email is updated', async () => {
    // Mock User.findByIdAndUpdate
    sinon.stub(User, 'findByIdAndUpdate').resolves(true);

    const res = await request(app)
      .put('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ oldEmail: 'emmanueleyang@gmail.com',
        newEmail: 'daniel.eyang@ovidot.com' });

    // Restore User.findByIdAndUpdate
    User.findByIdAndUpdate.restore();

    expect(res.statusCode).to.equal(200);
  });

  // DELETE /users/email - delete user by email
  it('should return 400 when no data is provided', async () => {
    const res = await request(app)
      .delete('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({});

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Fill required properties');
  });

  it('should return 404 when wrong email is passed', async () => {
    const res = await request(app)
      .delete('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'icantfind@oops.com' });

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'icantfind@oops.com not found');
  });

  it('should return 200 when email is deleted', async () => {
    // Mock User.findByIdAndDelete
    sinon.stub(User, 'findByIdAndDelete').resolves(true);

    const res = await request(app)
      .delete('/api/v1/admin/users/email')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`)
      .send({ email: 'emmanueleyang@gmail.com' });

    // Restore User.findByIdAndDelete
    User.findByIdAndDelete.restore();

    expect(res.statusCode).to.equal(204);
  });
});


describe('ADMIN CYCLE ROUTES', () => {
  // GET /cycles - Get all the cycles
  it('should fetch all cycles', async () => {
    const res = await request(app)
      .get('/api/v1/admin/cycles')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(200);
  });

  // GET /cycles/:cycleId - Get a single cycle
  it('should return 404 when wrong cycleId is passed', async () => {
    const res = await request(app)
      .get('/api/v1/admin/cycles/65628a803cd58e95534a5549')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'Cycle data not found');
  });

  it('should fetch a single cycle', async () => {
    const res = await request(app)
      .get('/api/v1/admin/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(200);
  });

  // DELETE /cycles/:cycleId - Delete a single cycle
  it('should return 404 when wrong cycleId is passed', async () => {
    const res = await request(app)
      .delete('/api/v1/admin/cycles/65628a803cd58e95534a5549')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'Data not found');
  });

  it('should delete a single cycle', async () => {
    // Mock Cycle.findByIdAndDelete
    sinon.stub(Cycle, 'findByIdAndDelete').resolves(true);

    const res = await request(app)
      .delete('/api/v1/admin/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${SUPER_ADMIN_TOKEN}`);

    // Restore Cycle.findByIdAndDelete
    Cycle.findByIdAndDelete.restore();

    expect(res.statusCode).to.equal(204);
  });
});
