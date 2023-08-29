const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const env = require("dotenv");
env.config();
const { MongoClient, ObjectId } = require("mongodb");
const Client = new MongoClient(process.env.DB_URL, (err) => console.error(err));
const { authentication, createToken } = require("./auth");
const { hashPassword, hashCompare } = require("./hashPassword");
const { mailer } = require("./nodeMail");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(
  cors({
    origin: "*",
  }),
  bodyParser.json({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.get("/get-data", authentication, async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let result = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({ _id: new ObjectId(req.headers.user_id) })
      .toArray();

    if (result) {
      let Tasks = result[0].tasks;
      res.json({
        statusCode: 200,
        Tasks,
      });
    } else {
      res.json({
        statusCode: 401,
        message: "Loading...",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.get("/get-task/:id", authentication, async (req, res) => {
  await Client.connect();

  try {
    const db = Client.db(process.env.DB_NAME);
    let Tasks = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({
        _id: new ObjectId(req.headers.user_id),
        tasks: { $elemMatch: { id: parseInt(parseInt(req.params.id)) } },
      })
      .toArray();
    if (Tasks) {
      res.json({
        statusCode: 200,
        Tasks,
      });
    } else {
      res.json({
        statusCode: 401,
        message: "Loading...",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.post("/add-task", authentication, async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let Tasks = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .updateOne(
        { _id: new ObjectId(req.headers.user_id) },
        { $push: { tasks: req.body.data } }
      );

    if (Tasks) {
      res.json({
        statusCode: 200,
        message: "New Task Added",
      });
    } else {
      res.json({
        statusCode: 401,
        message: "failed",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.put("/task-status/:id", authentication, async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let Tasks = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .findOneAndUpdate(
        {
          _id: new ObjectId(req.headers.user_id),
          tasks: { $elemMatch: { id: parseInt(req.params.id) } },
        },
        {
          $set: {
            "tasks.$.status": req.body.status,
            "tasks.$.submittedTime": req.body.time,
          },
        }
      );

    if (Tasks) {
      res.json({
        statusCode: 200,
        message: "Task Completed",
      });
    } else {
      res.json({
        statusCode: 401,
        message: "failed",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.put("/update-task/:id", authentication, async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let Tasks = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .findOneAndUpdate(
        {
          _id: new ObjectId(req.headers.user_id),
          tasks: { $elemMatch: { id: parseInt(req.params.id) } },
        },
        {
          $set: {
            "tasks.$.tittle": req.body.tittle,
            "tasks.$.description": req.body.description,
          },
        }
      );

    if (Tasks) {
      res.json({
        statusCode: 200,
        message: "Updated Successful",
      });
    } else {
      res.json({
        statusCode: 401,
        message: "failed",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});

app.post("/signup", async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let users = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();
    if (users.length === 0) {
      let hashedPassword = (req.body.password = await hashPassword(
        req.body.password
      ));
      if (hashedPassword) {
        let user = await db
          .collection(process.env.DB_COLLECTION_ONE)
          .insertOne(req.body);
        if (user) {
          res.json({
            statusCode: 200,
            message: "Signup successful",
          });
        }
      } else {
        res.json({
          statusCode: 404,
          message: "password not found",
        });
      }
    } else {
      res.json({
        statusCode: 401,
        message: "User was already exist, please Login...",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.post("/login", async (req, res) => {
  await Client.connect();

  try {
    const db = Client.db(process.env.DB_NAME);
    let user = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();

    if (user.length === 1) {
      let hashResult = await hashCompare(req.body.password, user[0].password);

      if (hashResult) {
        let token = await createToken(req.body.email, req.body.name);
        if (token) {
          res.json({
            statusCode: 200,
            message: "Login successful",
            token,
            user,
          });
        } else {
          res.json({
            statusCode: 401,
            message: "token not found",
          });
        }
      } else {
        res.json({
          statusCode: 404,
          message: "invalid credentials",
        });
      }
    } else {
      res.json({
        statusCode: 402,
        message: "User does not exist",
      });
    }
  } catch {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.post("/reset-email-verify", async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);

    let user = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.email })
      .toArray();
    if (user.length === 1) {
      let digits = "123456789";
      let OTP = "";
      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 9)];
      }
      if (OTP) {
        let saveOtp = await db
          .collection(process.env.DB_COLLECTION_ONE)
          .findOneAndUpdate(
            { _id: new ObjectId(user[0]._id) },
            { $push: { otp: OTP } }
          );
        if (saveOtp) {
          await mailer(req.body.email, OTP);

          res.json({
            statusCode: 200,
            message: "OTP has sent successful",
          });
        } else {
          res.json({
            statusCode: 402,
            message: "Otp generation failed",
          });
        }
      } else {
        res.json({
          statusCode: 403,
          message: "Otp generation failed",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User does not exist, Do register...",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.post("/reset-otp-verify", async (req, res) => {
  await Client.connect();
  try {
    const db = Client.db(process.env.DB_NAME);
    let user = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .find({ email: req.body.user })
      .toArray();
    if (user) {
      let verify = user[0].otp.includes(req.body.data.otp);
      if (verify) {
        res.json({
          statusCode: 200,
          message: "Verification successful. Wait...",
          userId: user[0]._id,
        });
      } else {
        res.json({
          statusCode: 401,
          message: "invalid Otp",
        });
      }
    } else {
      res.json({
        statusCode: 402,
        message: "User does not exist",
      });
    }
  } catch {
    res.json({
      statusCode: 500,
      message: "internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.put("/password-reset/:id", async (req, res) => {
  await Client.connect();
  try {
    const Db = Client.db(process.env.DB_NAME);
    let users = await Db.collection(process.env.DB_COLLECTION_ONE)
      .find({ _id: new ObjectId(req.params.id) })
      .toArray();
    if (users) {
      if (req.body.password === req.body.confirmPassword) {
        let hashpassword = await hashPassword(req.body.password);

        if (hashpassword) {
          let update = await Db.collection(
            process.env.DB_COLLECTION_ONE
          ).findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: { password: hashpassword } }
          );
          if (update) {
            res.json({
              statusCode: 200,
              message: "Password changed successfully",
            });
          } else {
            res.json({
              statusCode: 401,
              message: "updated failed",
            });
          }
        } else {
          res.json({
            statusCode: 402,
            message: "hashing failed",
          });
        }
      } else {
        res.json({
          statusCode: 403,
          message: "Details does not match",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User does not exist",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.delete("/delete-task/:id", authentication, async (req, res) => {
  await Client.connect();

  try {
    const db = Client.db(process.env.DB_NAME);
    let Tasks = await db
      .collection(process.env.DB_COLLECTION_ONE)
      .findOneAndUpdate(
        {
          _id: new ObjectId(req.headers.user_id),
          tasks: { $elemMatch: { id: parseInt(req.params.id) } },
        },
        { $pull: { tasks: { id: parseInt(req.params.id) } } }
      );

    if (Tasks) {
      res.json({
        statusCode: 200,
        message: "Task Deleted",
      });
    } else {
      res.json({
        statusCode: 401,
        message: "failed",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: "Internal server error",
      error: error,
    });
  } finally {
    await Client.close();
  }
});
app.listen(PORT, () => {
  console.log(`Server is Running into: ${PORT}`);
});
