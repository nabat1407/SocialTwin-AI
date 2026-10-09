import { githubAnalysisRequest } from '@/lib/github-contracts';
import { analyzePublicGithub } from '@/lib/server/github';
import { failure, readBody, success } from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    const { username, repositories, locale } = await readBody(request, githubAnalysisRequest);
    return success(await analyzePublicGithub(username, repositories, locale));
  } catch (error) {
    return failure(error);
  }
}
