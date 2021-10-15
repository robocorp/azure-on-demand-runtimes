export interface AutologonParams {
  password: string;
  domain: string;
  username: string;
}

export const autologon = (params: AutologonParams) => `
<AutoLogon>
   <Password>
      <Value>${params.password}</Value>
   </Password>
   <Domain>${params.domain}</Domain>
   <Enabled>true</Enabled>
   <LogonCount>2</LogonCount>
   <Username>${params.username}</Username>
</AutoLogon>
`;
