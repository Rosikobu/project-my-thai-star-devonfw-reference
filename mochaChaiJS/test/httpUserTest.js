let chai = require('chai');
let chaiHttp = require('chai-http');

// Assertion Style
chai.should();

chai.use(chaiHttp);

const server = "http://localhost:8081/mythaistar/services/rest";

const userAPI = "/usermanagement/v1/user"

describe('User-API', () => {
    // GET by ID
    describe('GET /usermanagement/user/', () => {

        it('It should get User by ID', (done) => {
            chai.request(server)
                .get(userAPI + "/1")
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property('id');
                    response.body.should.be.a('object');
                    response.body.should.have.property('username');
                    response.body.should.have.property('password');
                done();
                })
        })

        it('It should get an correct User by specific ID', (done) => {
            chai.request(server)
                .get(userAPI + "/1")
                .end((err, response) => {
                    response.body.id.should.be.eq(1);
                    response.body.username.should.be.eq('alex.r');
                    response.body.email.should.be.eq('alex-rodriguez@gmx.net');
                done();
                })
        })

        it('It should give permission denied to access user list', (done) => {
            chai.request(server)
                .get(userAPI + "/")
                .end((err, response) => {
                    response.should.have.status(405);
                    done();
                })
        })
    })


    // POST
    describe('POST /usermanagement/user/', () => {

        const user = {
            username: "Lilith",
            password: "12345",
            email: "mail@web.de",
            userRoleId: 0,
            twoFactorStatus: null
        };

        it('It should post a new User', (done) => {
            chai.request(server)
                .post(userAPI + "/")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    response.body.should.have.property('username').eq('Lilith');
                done();
                })
        })

        /*
        it('It should not be able to save email twice', (done) => {
            chai.request(server)
                .post(userAPI + "/")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(500);
                done();
                })
        })*/
    })

    // DELETE

});

/*
https://www.chaijs.com/plugins/chai-http/
https://www.chaijs.com/api/assert/


npm init
npm install mocha chai --save-dev
npm install chai-http
npm run test
*/