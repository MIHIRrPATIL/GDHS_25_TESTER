-- CreateTable
CREATE TABLE "public"."Patient" (
    "patientID" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "occupation" TEXT NOT NULL,
    "isSmoker" BOOLEAN NOT NULL,
    "isDrunkard" BOOLEAN NOT NULL,
    "exercise" TEXT NOT NULL,
    "chronicDisease" TEXT NOT NULL,
    "allergies" TEXT NOT NULL,
    "currentMeds" TEXT NOT NULL,
    "familyHistory" TEXT NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("patientID")
);
