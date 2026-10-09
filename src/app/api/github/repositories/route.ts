import { repositoryRequest } from '@/lib/github-contracts';
import { listPublicRepositories } from '@/lib/server/github';
import { failure, readBody, success } from '@/lib/server/http';
export async function POST(request: Request) {
  try {
    const { username } = await readBody(request, repositoryRequest);
    return success(await listPublicRepositories(username));
  } catch (error) {
    return failure(error);
  }
}
