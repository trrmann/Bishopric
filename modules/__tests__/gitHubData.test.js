import { GitHubData } from '../gitHubData.mjs';

describe('GitHubData', () => {
  test('constructor sets properties', () => {
    const gh = new GitHubData('owner', 'repo', 'data', 'dev');
    expect(gh.RepoOwner).toBe('owner');
    expect(gh.RepoName).toBe('repo');
    expect(gh.DataPath).toBe('data');
    expect(gh.Branch).toBe('dev');
  });

  test('CopyFromJSON and CopyToJSON work as expected', () => {
    const json = { repoOwner: 'owner', repoName: 'repo', dataPath: 'data', branch: 'main' };
    const instance = GitHubData.CopyFromJSON(json);
    expect(instance.RepoOwner).toBe('owner');
    expect(instance.RepoName).toBe('repo');
    expect(instance.DataPath).toBe('data');
    expect(instance.Branch).toBe('main');
    const out = GitHubData.CopyToJSON(instance);
    expect(out.repoOwner).toBe('owner');
    expect(out.repoName).toBe('repo');
    expect(out.dataPath).toBe('data');
    expect(out.branch).toBe('main');
  });

  test('CopyFromObject copies properties', () => {
    const dest = new GitHubData('a', 'b', 'c', 'd');
    const src = { repoOwner: 'x', repoName: 'y', dataPath: 'z', branch: 'w' };
    GitHubData.CopyFromObject(dest, src);
    expect(dest.RepoOwner).toBe('x');
    expect(dest.RepoName).toBe('y');
    expect(dest.DataPath).toBe('z');
    expect(dest.Branch).toBe('w');
  });

  test('Factory returns new instance', async () => {
    const instance = await GitHubData.Factory('owner', 'repo', 'data', 'main');
    expect(instance).toBeInstanceOf(GitHubData);
    expect(instance.RepoOwner).toBe('owner');
    expect(instance.RepoName).toBe('repo');
    expect(instance.DataPath).toBe('data');
    expect(instance.Branch).toBe('main');
  });

  test('GetHost, GetProject, GetDataPath, GetConfigurationURL return expected values', () => {
    const gh = new GitHubData('owner', 'repo', 'data', 'main');
    expect(gh.GetHost()).toBe('https://owner.github.io');
    expect(gh.GetProject()).toBe('repo');
    expect(gh.GetDataPath()).toBe('data');
    expect(gh.GetConfigurationURL('file.json')).toBe('https://owner.github.io/repo/data/file.json');
  });
});
