'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { TEST_DATABASE_URL } = require('./config');

chai.use(chaiHttp);

// seeds the test-database with mock data
function seedUserCommentData() {
  console.info('seeding user comment data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push(generateUserCommentData());
  }
  return UserComment.insertMany(seedData);
}

// creates an array of random usernames
function generateUserName() {
  let randomUser = faker.name.findName();
  let users = [];
  for (let i = 0; i < 5; i++) {
    users.push(randomUser);
  }
  return users[Math.floor(Math.random() * users.length)];
}

// creates an array of user comments
function generateComment() {
  let randomComment = faker.lorem.sentences();
  let comments = [];
  for (let i = 0; i < 5; i++) {
    comments.push(randomComment);
  }
  return comments[Math.floor(Math.random() * comments.length)];
}

// creates user comment objects
function generateUserCommentData() {
  return {
    userName: generateUserName(),
    comment: generateComment()
  };
}

// remove test-database
function tearDownDb() {
  console.warn('deleting database');
  return mongoose.connection.dropDatabase();
}

// database 'open server, create database, remove database, close server' process
describe('user comment data resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedUserCommentData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  // GET test
  describe('GET', function() {
    it('should get all existing user comments', function() {
      return chai
        .request(app)
        .get('/locations/comment')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
        });
    });

    it('should get user comments with correct fields', function(done) {
      let resUserComment;
      return chai
        .request(app)
        .get('/locations/comment')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          res.body.forEach(userComment => {
            expect(userComment).to.be.a('object');
            expect(userComment).to.include.keys('_id', 'userName', 'comment');
          });
          resUserComment = res.body[0];
          console.log(resUserComment._id);
          return UserComment.findById(resUserComment._id);
        })
        .then(userComment => {
          expect(resUserComment.userName).to.equal(userComment.userName);
          expect(resUserComment.comment).to.equal(userComment.comment);
        })
        .then(done());
    });
  });

  // POST test
  describe('POST', function() {
    it('should post a new comment', function(done) {
      const newUserComment = generateUserCommentData();

      return chai
        .request(app)
        .post('/locations/comment')
        .send(newUserComment)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('userName', 'comment');
          expect(res.body.id).to.have.lengthOf.at.least(1);
          expect(res.body.userName).to.equal(newUserComment.userName);
          expect(res.body.comment).to.equal(newUserComment.comment);
          return UserComment.findById(res.body.id);
        })
        .then(userComment => {
          expect(userComment.userName).to.equal(newUserComment.userName);
          expect(userComment.comment).to.equal(newUserComment.comment);
        })
        .then(done())
        .catch(err => err);
    });
  });

  // PUT test
  describe('PUT', function() {
    it('should update sent fields', function() {
      const updateUserComment = {
        userName: faker.name.findName(),
        comment: faker.lorem.sentences()
      };
      return UserComment.findOne()
        .then(userComment => {
          updateUserComment.id = userComment.id;
          return chai
            .request(app)
            .put(`/locations/comment/${userComment.id}`)
            .send(updateUserComment);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return UserComment.findById(updateUserComment.id);
        })
        .then(userComment => {
          expect(userComment.userName).to.equal(updateUserComment.userName);
          expect(userComment.comment).to.equal(updateUserComment.comment);
        });
    });
  });

  // DELETE test
  describe('DELETE', function() {
    it('should delete a comment by id', function() {
      let userComment;
      return UserComment.findOne()
        .then(_userComment => {
          userComment = _userComment;
          return chai
            .request(app)
            .delete(`/locations/comment/${userComment.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return UserComment.findById(userComment.id);
        })
        .then(_userComment => expect(_userComment).to.be.null);
    });
  });
});
