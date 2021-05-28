import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { t } from '../../../i18n/utils/intl';
import { Button } from '../../../uiKit/Button';
import { useWrongNetworkContentStyles } from './useWrongNetworkContentStyles';
import { useAccount } from '../../../account/hooks/useAccount';

interface IWrongNetworkContentProps {
  handleConnect?: () => void;
}

export const WrongNetworkContent = ({
  handleConnect,
}: IWrongNetworkContentProps) => {
  const classes = useWrongNetworkContentStyles();

  const {
    handleChangeNetworkToSupported,
    walletSupportNetworkChange,
    loading,
  } = useAccount();

  handleConnect = handleConnect ?? handleChangeNetworkToSupported;

  return (
    <Box mb={3} textAlign="center" className={classes.root}>
      <Typography variant="h1" className={classes.caption}>
        {t('change-wallet.title')}
      </Typography>
      <Typography variant="body1" className={classes.text}>
        {t('change-wallet.description')}
      </Typography>
      {walletSupportNetworkChange && (
        <Button
          onClick={handleConnect}
          disabled={loading}
          className={classes.connectBtn}
        >
          {t('change-wallet.submit')}
        </Button>
      )}
    </Box>
  );
};