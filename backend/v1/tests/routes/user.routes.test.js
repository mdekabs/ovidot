import request from 'supertest';
import { expect } from 'chai';
import app from '../../../app.js';
import mongoose from 'mongoose';
import sinon from 'sinon';
import dotenv from 'dotenv';
import User from '../../models/user.model.js';
dotenv.config();

const token = process.env.TEST_TOKEN;

describe('GET /users/get', () => {
  it('should fetch the user data', async () => {
    const res = await request(app)
      .get('/api/v1/auth/users/get')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('userId');
    expect(res.body).to.have.property('email');
    expect(res.body).to.have.property('username');
    expect(res.body).to.have.property('age');
    expect(res.body).to.have.property('period');
  });

  it('should return 404 when no user is found', async () => {
    // Mock the User.findById method to return null
    sinon.stub(User, 'findById').resolves(null);
 
    const res = await request(app)
      .get('/api/v1/auth/users/get')
      .set('Authorization', `Bearer ${token}`);
 
    // Restore the original method
    User.findById.restore();
 
    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'User not found');
  });
});


describe('PUT /users/update', () => {
  it('should return 400 error when no data is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Provide atleast a param to update: username, period or age');    
  });

  it('should update the user data', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'Tediyang', age: 25 });
    
    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('userId');
    expect(res.body).to.have.property('email');
    expect(res.body).to.have.property('username');
    expect(res.body).to.have.property('age');
    expect(res.body).to.have.property('period');
  });

  it('should return 400 when invalid username is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 9});
    
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("message", "Invalid value");
  });

  it('should return 400 when invalid age is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 7});
    
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("message", "Invalid value");
  });

  it('should return 400 when invalid period is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ period: 0});
    
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("message", "Invalid value");
  })

  it('should return 404 when no user is found', async () => {
    // Mock the User.findById method to return null
    sinon.stub(User, 'findByIdAndUpdate').resolves(null);

    const res = await request(app)
      .put('/api/v1/auth/users/update')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'Tediyang', age: 25 });

    // Restore the original method
    User.findByIdAndUpdate.restore();

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property("message", "User not found");
  });
});


describe('DELETE /users/delete', () => {
  it.skip('should delete the user', async () => {
    // Mack the User.findByIdAndDelete method to prevent removal of user data
    sinon.stub(User, 'findByIdAndDelete').resolves({
      username: 'Teddy',
      email: 'daniel.eyang.ed@gmail.com'});

    const res = await request(app)
      .delete('/api/v1/auth/users/delete')
      .set('Authorization', `Bearer ${token}`)
    
    // Restore the original method
    User.findByIdAndDelete.restore();

    expect(res.statusCode).to.equal(204);
  });

  it('should return 404 when no user is found', async () => {
    // Mack the User.findByIdAndDelete method
    sinon.stub(User, 'findByIdAndDelete').resolves(null);

    const res = await request(app)
      .delete('/api/v1/auth/users/delete')
      .set('Authorization', `Bearer ${token}`)
    
    // Restore the original method
    User.findByIdAndDelete.restore();

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property("message", "User not found");
  });
});


describe('PUT /users/change-password', () => {
  after(async () => {
    // Close the database connection
    await mongoose.connection.close();
  });

  it('should return 400 when user data is not passed', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).to.equal(400)
    expect(res.body).to.have.property("message", "Invalid value");
  });

  it('should return 404 when no user is found', async () => {
    // Mock the User.findById
    sinon.stub(User, 'findById').resolves(null);

    const res = await request(app)
      .put('/api/v1/auth/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Ovidotsuper', newPassword: 'Ovidotsuper123'});

    User.findById.restore();

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property("message", "User not found");
  });

  it('should return 400 when the current password is wrong', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Ovidotsupe', newPassword: 'Ovidotsuper123'});

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("message", "Current password is incorrect");
  });

  it.skip('should update the user password', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Ovidotsuper', newPassword: 'Ovidotsuper123'});

      expect(res.statusCode).to.equal(204);
  });

  it.skip('should return 400 when the two passwords are the same', async () => {
    const res = await request(app)
      .put('/api/v1/auth/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'Ovidotsuper', newPassword: 'Ovidotsuper'});

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("message", "Please provide a new password");
  });
});


describe('GET /logout', () => {
  // after(async () => {
  //   // Close the database connection
  //   await mongoose.connection.close();
  // });

  it.skip('should log out the user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
  });
});
