import request from 'supertest';
import { expect } from 'chai';
import app from '../../../app.js';
import sinon from 'sinon';
import dotenv from 'dotenv';
import Cycle from '../../models/cycle.model.js';
import User from '../../models/user.model.js';
dotenv.config();

const token = process.env.TEST_TOKEN;
const testid = process.env.TESTID;

describe('POST /cycles/create', () => {
  let clock;

  after(() => {
    // Even if one of this test fails restore the time not to affect others.
    clock.restore()
  });

  it('should return 400 when startdate is invalid', async () => {
    // Use fakeTimer to set Time
    clock = sinon.useFakeTimers(new Date('2023-11-26').getTime());

    const res = await request(app)
      .post('/api/v1/auth/cycles/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 4,
        startdate: '2023-11-01'
      });

    // Restore Time
    clock.restore();

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", 'Specify a proper date: Date should not be less than 21 days or greater than present day');
  });

  it('should return 400 error when no data is provided', async () => {
    const res = await request(app)
      .post('/api/v1/auth/cycles/create')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", "Invalid value");
  });

  it.skip('should create a new cycle with ovulation date provided', async () => {
    // Use fakeTimer to set Time
    clock = sinon.useFakeTimers(new Date('2024-01-23').getTime());

    const res = await request(app)
      .post('/api/v1/auth/cycles/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 4,
        startdate: '2024-01-23',
        ovulation: '2024-02-07'
      });

    // Restore Time
    clock.restore();

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("message", "Cycle created");
    expect(res.body).to.have.property("cycleId");
  });

  it('returns 400 when user creates another cycle in a month below the required days', async () => {
    // Use fakeTimer to set Time
    clock = sinon.useFakeTimers(new Date('2023-12-05').getTime());

    const res = await request(app)
      .post('/api/v1/auth/cycles/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 4,
        startdate: '2023-12-05'
      });

    // Restore Time
    clock.restore();

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", "Cycle already exist for this month: Delete to create another");
  });

  it.skip('should create a new cycle for the next month >= next date', async () => {
    // Use fakeTimer to set Time
    clock = sinon.useFakeTimers(new Date('2023-12-25').getTime());

    const res = await request(app)
      .post('/api/v1/auth/cycles/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 4,
        startdate: '2023-12-25',
      });

    // Restore Time
    clock.restore();

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("message", "Cycle created");
    expect(res.body).to.have.property("cycleId");
  });
});


describe('GET /cycles/getall', () => {
  it('should fetch all cycles', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/getall')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
  });

  it('should fetch all cycles for a given year', async () => {
    const res1 = await request(app)
      .get('/api/v1/auth/cycles/getall?year=2023')
      .set('Authorization', `Bearer ${token}`);

    const res2 = await request(app)
      .get('/api/v1/auth/cycles/getall?year=2024')
      .set('Authorization', `Bearer ${token}`);

    expect(res1.statusCode).to.equal(200);
    expect(res2.statusCode).to.equal(200);

    expect(res1.body).to.be.an('array').that.not.empty;
    expect(res2.body).to.be.an('array').that.not.empty;
  });

  it('should check if the function never ran (caching)', async () => {
    // Since the testdb is populated with data, we will check if the function never ran
    const findByIdStub = sinon.stub(User, 'findById').resolves(null);

    const res = await request(app)
      .get('/api/v1/auth/cycles/getall?year=2023')
      .set('Authorization', `Bearer ${token}`);

    // restore the original function
    findByIdStub.restore();

    // check if the function ran
    expect(findByIdStub.called).to.be.false;
    expect(res.body).to.be.an('array').that.not.empty;
  });
});


describe('GET /cycles/:cycleId', () => {
  it('should fetch a specific cycle', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/6588c6003967191f592da670')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('object');
    expect(res.body).to.have.property('ovulation');
    expect(res.body).to.have.property('period');
    expect(res.body).to.have.property('start_date');
  });

  it('should return 404 when no cycle is found', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/65628a803cd58e95534a5549')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('message', 'Cycle not found');
  });
});


describe('GET /cycles/getcycles/:month', () => {
  it('should fetch cycle(s) for a specific month using number', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/getcycles/11')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
  });

  it('should fetch cycle(s) for a specific month using string', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/getcycles/december')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
  });

  it('should fetch cycle for a specific month with year query', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/getcycles/11?year=2023')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.be.an('array').that.is.not.empty;
  });

  it('should return 400 if invalid year is given', async () => {
    const res = await request(app)
      .get('/api/v1/auth/cycles/getcycles/11?year=twothousandtwentythree')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'Invalid year');
  });
});


describe('PUT /cycles/:cycleId', () => {
  it('should return 400 when no data is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", "Provide atleast a param to update: period or ovulation");
    });

	it('should return 400 when invalid ovulation format is provided', async () => {
		const res = await request(app)
			.put('/api/v1/auth/cycles/65628a803967191f592da668')
			.set('Authorization', `Bearer ${token}`)
			.send({
				ovulation: '202-11-21'
			});

		expect(res.statusCode).to.equal(400);
		expect(res.body).to.have.property("message", "Invalid value");
	});

	it('should return 400 when invalid period range is provided', async () => {
		const res = await request(app)
			.put('/api/v1/auth/cycles/65628a803967191f592da668')
			.set('Authorization', `Bearer ${token}`)
			.send({
				period: 0
			});

		expect(res.statusCode).to.equal(400);
		expect(res.body).to.have.property("message", "Invalid value");
	});

  it.skip('should return 400 when an invalid ovulation date is provided', async () => {
    const res = await request(app)
      .put('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ovulation: '2023-11-21'
      });

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", 'Ovulation date must not exceed 18 days from start date');
  });

  it('should return 400 when user try to update after 30days from start date', async () => {
    const res = await request(app)
      .put('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 6
      });

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property("message", "Update can't be made after 30 days from start date");
  });

  it.skip('should update the cycle with period given', async () => {
    const res = await request(app)
      .put('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`)
      .send({
        period: 6
      });

    expect(res.statusCode).to.equal(200);
    expect(res.body.updated.period).to.equal(6)
    expect(res.body.updated.period_range).to.have.lengthOf(6);
  });

  it.skip('should update the cycle with ovulation date given', async () => {
    const res = await request(app)
      .put('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ovulation: '2023-12-11'
      });

    expect(res.statusCode).to.equal(200);
    expect(res.body.updated.ovulation).to.equal('2023-12-11T00:00:00.000Z');
  });
});


describe('DELETE /cycles/:cycleId', () => {
  it.skip('should delete a cycle', async () => {
    // Mock Cycle.findByIdAndRemove
    sinon.stub(Cycle, 'findByIdAndRemove').resolves(
      {start_date: new Date(), updated_at: new Date()}
    );

    const res = await request(app)
      .delete('/api/v1/auth/cycles/65628a803967191f592da668')
      .set('Authorization', `Bearer ${token}`);

    // Restore Cycle.findByIdAndRemove
    Cycle.findByIdAndRemove.restore();

    expect(res.statusCode).to.equal(204);
  });
});
