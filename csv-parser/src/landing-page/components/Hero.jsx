import * as React from 'react';
import { alpha } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundImage: 'linear-gradient(180deg, #FCCEFD, #FFF)',
        backgroundSize: '100% 20%',
        backgroundRepeat: 'no-repeat',
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14,sm: 20 },
        }}
      >

        <Typography
          component="h1"
          variant="h1"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column',md: 'row' },
            alignSelf: 'center',
            textAlign: 'center',
          }}
        >
          Welcome to&nbsp;
          <Typography
            component="span"
            variant="h1"
            sx={{
              color: "#B60092"
            }}
          >
            Brex
          </Typography>
        </Typography>

        <Stack
          direction={{ xs: 'column',sm: 'row' }}
          alignSelf="center"
          spacing={1}
          useFlexGap
          sx={{ pt: 2,width: { xs: '100%',sm: 'auto' } }}
        >
        </Stack>

      </Container>
    </Box>
  );
}
