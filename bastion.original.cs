using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Discord;
using System.Text.RegularExpressions;

namespace BastionBot
{
    class Program
    {
        static void Main(string[] args)
        {
            Random rng = new Random();
            DiscordClient client = new DiscordClient();
            string[] messages = new string[] { "Beep boop.", "Doo-woo.", "Sh-sh-sh.", "Beeple.", "Boo boo doo de doo.", "Dun dun boop boop.", "Ooh-ooo-hoo-hoo.", "Zwee?", "BWEEEEEEEEEEE.", "Chirr chirr chirr.", "DWEET DWEET DWEET!", "Hee hoo hoo.", "Boop beep." };

            client.MessageReceived += async (s, e) =>
            {
                if (!e.Message.IsAuthor)
                {
                    if (e.Channel.Name == "beep-boop")
                    {
                        int count = Regex.Matches(e.Message.Text.ToLower(), @"(ba+s+t+i+o+n)").Count;
                        if (count > 4)
                        {
                            Console.WriteLine("Responding to: " + e.Message.User + ":" + e.Message.Text);
                            Console.WriteLine("With PLAY OF THE GAME.");
                            await e.Channel.SendMessage("https://www.youtube.com/watch?v=HbrdTzxVKBY");
                        }
                        else
                        if (count > 0)
                        {
                            Console.WriteLine("Responding to: " + e.Message.User + ":" + e.Message.Text);
                            string st = "";
                            for (int i = 0; i < count; i++)
                            {
                                if (i > 0)
                                {
                                    st += " ";
                                }
                                st += messages[rng.Next(messages.Length)];
                            }
                            Console.WriteLine("With message: " + st);
                            await e.Channel.SendMessage(st);
                        }
                    }
                }
            };

            client.ExecuteAndWait(async () =>
            {
                await client.Connect("<TokenHere>", TokenType.Bot);

                Console.WriteLine("BastionBot Connected.");
                client.SetStatus(UserStatus.Online);
                Console.WriteLine("BastionBot Online.");
            });
        }
    }
}
