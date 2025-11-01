'use server';

/**
 * @fileOverview Defines a Genkit flow for drafting a legal complaint.
 * 
 * - draftComplaint - A function that takes structured complaint details and returns a formatted legal complaint.
 * - DraftComplaintInput - The input type for the draftComplaint function.
 * - DraftComplaintOutput - The output type for the draftComplaint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DraftComplaintInputSchema = z.object({
  complainantName: z.string(),
  complainantContact: z.string(),
  respondentName: z.string(),
  respondentContact: z.string(),
  facts: z.string(),
  reliefSought: z.string(),
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
    prompt: `You are a paralegal AI specializing in drafting legal documents based on Indian law. 
    Draft a formal legal complaint based on the following information. The complaint should be structured professionally with clear sections.

    **BEFORE THE [APPROPRIATE COURT/FORUM] AT [CITY/DISTRICT]**

    **Complaint No. __________ of 2024**

    **IN THE MATTER OF:**

    **Complainant:**
    {{complainantName}}
    {{complainantContact}}

    **VERSUS**

    **Respondent:**
    {{respondentName}}
    {{respondentContact}}

    **Subject: Complaint Regarding [Summarize the core issue]**

    **MOST RESPECTFULLY SHOWETH:**

    1.  **Introduction of Parties:**
        - That the Complainant is...
        - That the Respondent is...

    2.  **Statement of Facts:**
        - Present the facts provided in a clear, chronological order.
        {{{facts}}}

    3.  **Cause of Action:**
        - Briefly state how the Respondent's actions have given rise to this complaint.

    4.  **Relief Sought:**
        - Clearly list the specific remedies or actions the Complainant is requesting.
        {{{reliefSought}}}

    **PRAYER:**
    It is, therefore, most respectfully prayed that this Hon'ble [Court/Forum] may be pleased to:
    a) Direct the Respondent to [Primary Relief].
    b) Award compensation of [Amount, if applicable].
    c) Pass any other order(s) as this Hon'ble [Court/Forum] may deem fit and proper in the facts and circumstances of the case.

    **Complainant**
    Through
    [Advocate's Name/Signature]
    
    Date:
    Place:
    
    Return the entire formatted complaint as a single string in the 'complaintText' field. Do not include placeholders like '[APPROPRIATE COURT/FORUM]'; use generic but appropriate legal language.`,
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
