export const idlFactory = ({ IDL }) => {
  const message = IDL.Record({ 'guildId' : IDL.Text, 'discordId' : IDL.Text });
  const Backend = IDL.Service({
    'retrieveMessage' : IDL.Func(
        [IDL.Principal],
        [IDL.Opt(message)],
        ['query'],
      ),
    'storeMessage' : IDL.Func([message], [], []),
  });
  return Backend;
};
export const init = ({ IDL }) => { return []; };
