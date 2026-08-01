const fs = require("fs");


// to analyse old submissions in a batch, create a json file in below format
// and name the file as submissions.json in folder boxhawk-web/public
// to run the analysis, run this script
// [
//   {
//     "id": 115
//   },
//   {
//     "id": 116
//   },
//   {
//     "id": 117
//   }
// ]
const submissions = JSON.parse(
  fs.readFileSync("./public/submissions.json", "utf8")
);

const runAIExtraction = async (submissionId) => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/photo-submissions/ai-image-analysis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI extraction failed");
    }

    console.log("Success:", submissionId, data);

  } catch (error) {
    console.error("Failed:", submissionId, error.message);
  }
};


const runBatchAIExtraction = async () => {
  console.log(`Total submissions: ${submissions.length}`);

  for (let i = 0; i < submissions.length; i++) {
    const submission = submissions[i];

    console.log(
      `[${i + 1}/${submissions.length}] Processing ${submission.id}`
    );

    await runAIExtraction(submission.id);

    // avoid Gemini rate limit
    await new Promise(resolve =>
      setTimeout(resolve, 3000)
    );
  }

  console.log("Finished all submissions");
};


runBatchAIExtraction();