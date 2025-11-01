'use server';

/**
 * @fileOverview Defines a Genkit flow for drafting a legal complaint.
 * 
 * - draftComplaint - A function that takes structured complaint details and returns a formatted legal complaint.
 * - DraftComplaintInput - The input type for the draftComplaint function.
 * - DraftComplaintOutput - The output type for the draftComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DraftComplaintInputSchema = z.object({
    fullName: z.string().describe("The complainant's full name."),
    ageAndGender: z.string().describe("The complainant's age and gender."),
    parentName: z.string().describe("The complainant's father's or mother's name."),
    address: z.string().describe("The complainant's full residential address."),
    contactInfo: z.string().describe("The complainant's contact number and/or email."),
    occupation: z.string().describe("The complainant's occupation."),
    incidentDate: z.string().describe("The date, time, and place of the incident."),
    incidentDetails: z.string().describe("A clear, chronological description of what happened."),
    suspectDetails: z.string().describe("Details of the suspect(s), if known."),
    evidence: z.string().describe("Mention of any available evidence like photos, videos, or witnesses."),
    requestedAction: z.string().describe("The specific action the user wants to be taken."),
});
export type DraftComplaintInput = z.infer<typeof DraftComplaintInputSchema>;

const DraftComplaintOutputSchema = z.object({
  complaintText: z.string().describe("The full, formatted text of the legal complaint."),
});
export type DraftComplaintOutput = z.infer<typeof DraftComplaintOutputSchema>;

export async function draftComplaint(input: DraftComplaintInput): Promise<DraftComplaintOutput> {
    return draftComplaintFlow(input);
}

const prompt = ai.definePrompt({
    name: 'draftComplaintPrompt',
    input: { schema: DraftComplaintInputSchema },
    output: { schema: DraftComplaintOutputSchema },
    prompt: `You are a paralegal AI specializing in drafting legal complaints for police submission in India. 
    Draft a formal complaint (First Information Report - F.I.R.) based on the following information. The complaint should be structured professionally with clear sections.

    **To,
    The Officer In-charge,
    [Police Station Name],
    [City/District]**

    **Subject: First Information Report (F.I.R) regarding [Summarize the core issue from incident details]**

    Respected Sir/Madam,

    I, the undersigned, wish to lodge the following complaint for your investigation and necessary action.

    **1. Complainant's Details:**
    -   **Full Name:** {{fullName}}
    -   **Age & Gender:** {{ageAndGender}}
    -   **Father's/Mother's Name:** {{parentName}}
    -   **Occupation:** {{occupation}}
    -   **Address:** {{address}}
    -   **Contact Information:** {{contactInfo}}

    **2. Date, Time, and Place of Occurrence:**
    -   {{incidentDate}}

    **3. Details of the Suspect(s) (if known):**
    -   {{suspectDetails}}

    **4. Account of the Incident:**
    {{{incidentDetails}}}

    **5. Evidence or Supporting Material:**
    -   {{evidence}}

    **6. Prayer / Requested Action:**
    {{{requestedAction}}}

    I declare that the information provided above is true to the best of my knowledge and belief. I request you to kindly register an F.I.R under the relevant sections of the law and take prompt action.

    Thank you for your assistance.

    **Yours sincerely,**

    **{{fullName}}**

    Date: [Current Date]
    Place: [City of Incident]
    
    Return the entire formatted complaint as a single string in the 'complaintText' field. Use generic but appropriate legal language and fill in placeholders where possible based on the provided information.`,
});


const draftComplaintFlow = ai.defineFlow(
  {
    name: 'draftComplaintFlow',
    inputSchema: DraftComplaintInputSchema,
    outputSchema: DraftComplaintOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
