'use strict';

const expect = require('expect.js');
let nas = require('../lib/nas');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const assert = sinon.assert;

const region = 'cn-hangzhou';

var requestOption = {
  method: 'POST'
};

describe('test findNasFileSystem', async () => {

  afterEach(() => {
    sandbox.restore();
  });

  it('test', async () => {
    const description = 'test';

    const params = {
      'RegionId': region,
      'PageSize': 1000
    };

    const requestStub = sandbox.stub();
    
    requestStub.withArgs('DescribeFileSystems', params, requestOption).resolves({
      'FileSystems': {
        'FileSystem': [
          {
            'Description': description,
            'FileSystemId': '109c042666',
            'RegionId': 'cn-hangzhou',
            'MeteredSize': 1611661312
          }
        ]
      }
    });

    const nasPopClient = { request: requestStub };

    const findSystemId = await nas.findNasFileSystem(nasPopClient, region, description);
    
    expect(findSystemId).to.eql('109c042666');

    assert.calledWith(requestStub, 'DescribeFileSystems', params, requestOption);  
  });

});

describe('test findMountTarget', async () => {

  afterEach(() => {
    sandbox.restore();
  });

  it('test', async () => {
    const fileSystemId = '123';
    const vpcId = 'vpc-bp1me4doa1zk2mwhksx4q';
    const vswId = 'vpc-bp1me4doa1zk2mwhksx4q';
    const mountTargetDomain = '0d2574b319-doo72.cn-hangzhou.nas.aliyuncs.com';

    const params = {
      'RegionId': region,
      'FileSystemId': fileSystemId
    };

    const requestStub = sandbox.stub();
    
    requestStub.withArgs('DescribeMountTargets', params, requestOption).resolves({
      'MountTargets': {
        'MountTarget': [
          {
            'VswId': vswId,
            'VpcId': vpcId,
            'MountTargetDomain': mountTargetDomain
          }
        ]
      }
    });

    const nasPopClient = { request: requestStub };

    const mountTarget = await nas.findMountTarget(nasPopClient, region, fileSystemId, vpcId, vswId);
    
    expect(mountTarget).to.eql(mountTargetDomain);

    assert.calledWith(requestStub, 'DescribeMountTargets', params, requestOption);  
  });
});

describe('test createMountTarget', async () => {

  afterEach(() => {
    sandbox.restore();
  });

  it('test', async () => {
    const fileSystemId = '123';
    const vpcId = 'vpc-bp1me4doa1zk2mwhksx4q';
    const vswId = 'vpc-bp1me4doa1zk2mwhksx4q';
    const mountTargetDomain = '0d2574b319-doo72.cn-hangzhou.nas.aliyuncs.com';

    const params = {
      'RegionId': region,
      'NetworkType': 'Vpc',
      'FileSystemId': fileSystemId,
      'AccessGroupName': 'DEFAULT_VPC_GROUP_NAME',
      'VpcId': vpcId,
      'VSwitchId': vswId
    };

    const requestStub = sandbox.stub();
    
    requestStub.withArgs('CreateMountTarget', params, requestOption).resolves({
      'MountTargetDomain': '0d2574b319-doo72.cn-hangzhou.nas.aliyuncs.com'
    });

    const nasPopClient = { request: requestStub };

    const mountTarget = await nas.createMountTarget(nasPopClient, region, fileSystemId, vpcId, vswId);
    
    expect(mountTarget).to.eql(mountTargetDomain);

    assert.calledWith(requestStub, 'CreateMountTarget', params, requestOption);  
  });
});