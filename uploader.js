"use strict";

const AWS = require("aws-sdk");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const s3 = new AWS.S3();
const TikTokScraper = require("tiktok-scraper");
const bucket = process.env.Bucket;

module.exports.handler = async (event, context, callback) => {
  let username =
    (event.queryStringParameters && event.queryStringParameters.username) || "";

  if (!username) {
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "Please input username.",
      }),
    });
    return;
  }

  let userAvatarURL = "";

  try {
    let tiktokResponse = await TikTokScraper.getUserProfileInfo(username, null);

    if (tiktokResponse.user) {
      userAvatarURL = tiktokResponse.user.avatarLarger;
    }
  } catch (e) {
    console.log(e);
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "The user who has the username does not exist.",
      }),
    });
    return;
  }

  let resultURL = "";

  if (userAvatarURL) {
    const objectKey = `image-${uuidv4()}.png`;

    const { data } = await axios.get(encodeURI(userAvatarURL), {
      responseType: "arraybuffer",
    });

    const uploadResult = await s3
      .upload({
        ACL: "public-read",
        Bucket: bucket,
        Key: objectKey,
        Body: data,
      })
      .promise();

    if (uploadResult.Location) {
      resultURL = uploadResult.Location;
    }
  }

  if (resultURL) {
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, url: resultURL }),
    });
  } else {
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "failed to get the profile image.",
      }),
    });
  }
};
