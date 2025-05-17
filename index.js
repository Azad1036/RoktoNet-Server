const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://nexdrive-rentals.web.app",
    "https://quiet-mooncake-d6e5db.netlify.app",
    "https://nexdrive-rentals.firebaseapp.com",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
// MedleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello!");
});

const uri = "mongodb://localhost:27017/";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function runDB() {
  const roktoNetDB = client.db("roktoNetDB");
  const usersDBCollection = roktoNetDB.collection("UsersDB");
  const userDonationRequest = roktoNetDB.collection("donationRequestDB");

  try {
    // user register API
    app.post("/users", async (req, res) => {
      const users = req.body;
      const storeUsers = await usersDBCollection.insertOne(users);
      res.send(storeUsers);
    });

    // Search Doner
    app.get("/searchDoner", async (req, res) => {
      console.log(req.query);
      const { bloodGroup, district, upazila } = req.query;

      // Check Doner Search Data
      if (!bloodGroup && !district && !upazila) {
        return res.send([]);
      }

      const query = {};
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (district) query.district = district;
      if (upazila) query.upazila = upazila;

      const donerFind = await usersDBCollection.find(query).toArray();

      res.send(donerFind);
    });

    // Single User Profile API
    app.get("/userProfile/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const findUser = await usersDBCollection.findOne(query);
      res.send(findUser);
    });

    // Update User Profile
    app.put("/updateProfile/:email", async (req, res) => {
      const email = req.params.email;
      const userUpdateDate = req.body;
      const query = { email };
      const update = {
        $set: userUpdateDate,
      };
      const updateProfile = await usersDBCollection.updateOne(query, update);
      res.send(updateProfile);
    });

    // DashBoard Page

    // Donor Dashboard //
    // Create Donation Request Api
    app.post("/create-donation-request", async (req, res) => {
      const createRequest = req.body;
      const donationReques = await userDonationRequest.insertOne(createRequest);
      res.send(donationReques);
    });

    // My Donation Requests Api
    app.get("/my-donation-requests/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const myDonationRequestslist = await userDonationRequest
        .find(query)
        .toArray();
      res.send(myDonationRequestslist);
    });

    // Edit Request Api get
    app.get("/edit-request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const findEditReq = await userDonationRequest.findOne(query);
      res.send(findEditReq);
    });

    // Update Edit Request Api
    app.put("/update-donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: body,
      };
      const updateDonationRequests = await userDonationRequest.updateOne(
        query,
        update
      );
      res.send(updateDonationRequests);
    });
  } catch (error) {
    console.log(error);
  }
}

runDB();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
