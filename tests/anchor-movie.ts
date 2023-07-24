import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { AnchorMovie } from '../target/types/anchor_movie';
import { assert, expect } from 'chai';
import { PublicKey } from '@solana/web3.js';

describe('anchor-movie', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorMovie as Program<AnchorMovie>;

  const movie = {
    title: 'Just a test movie',
    description: 'Wow what a good movie it was real great',
    rating: 5,
  };

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    new PublicKey('5oYVhrRPbeUzBcvWADXXCgYSo9cF68RRdS4zyLoJe9Pe')
  );

  it('Movie review is added`', async () => {
    // Add your test here.
    console.log('testing movie review');
    const tx = await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        movieReview: moviePda,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(movie.rating === account.rating);
    expect(movie.description === account.description);
    expect(account.reviewer === provider.wallet.publicKey);
  });

  it('Movie review is updated`', async () => {
    const newDescription = 'Wow this is new';
    const newRating = 4;

    const tx = await program.methods
      .updateMovieReview(movie.title, newDescription, newRating)
      .accounts({
        movieReview: moviePda,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(movie.title === account.title);
    expect(newRating === account.rating);
    expect(newDescription === account.description);
    expect(account.reviewer === provider.wallet.publicKey);
  });

  it('Deletes a movie review', async () => {
    const tx = await program.methods
      .deleteMovieReview(movie.title)
      .accounts({
        movieReview: moviePda,
      })
      .rpc();
  });
});
