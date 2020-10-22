<h1>#!/Shabang | Condution</h1>

<a href=""><img src="https://img.shields.io/badge/Maintenance%20Level-Actively%20Developed-brightgreen.svg"/> </a>
<a href="https://github.com/Shabang-Systems/Condution/releases/"><img src="https://img.shields.io/github/package-json/v/shabang-systems/condution"/> </a>
<a href=""><img src="https://img.shields.io/github/license/shabang-systems/condution"/> </a>

**This. Is. Condution.** A personal project management system that makes sense and will not burn your pockets out.

***

## Those Download Buttons?
👉 [**Direct Download**](https://condution.shabang.cf/#downloads) the latest version of Condution here! 👈 

Also, here's the [App Store](https://apps.apple.com/us/app/condution/id1523249900) & [Play Store](https://play.google.com/store/apps/details?id=cf.shabang.condution) links for y'all phone nerds out there.

## The App
Condution is a wonderful electron app built to create a perfectly easy task-management dashboard that's powerful, yet also simple. The inspiration of the project spanned from our long frustration with the current state of productivity software on the internet — they are expensive and often complicated to use.

Condution attempts to change this. We want to create an open-source productivity/task-management app that is both simple, and, well, free (but we do take [Patreon](https://www.patreon.com/condution) donations though).

<p align="center">
  <img src="https://condution.shabang.cf/images/pic06.png" />
  <i>This. Is. (Actually.) Condution.</i>
</p>

### Features 
#### The Standard Spiel
Create tasks, manage them in projects, add some tags, set due dates, and repeat them at will. Condution has the whole nine-yards of the core list-making features nailed so you could create and edit anything from grocery lists to hundred-task projects.

#### Due + Start Dates (and Times!)
Yes, you heard it right! Unlike some of the other apps out there, we know that timing is important to people! Every task is hidden until a certain *time* and due at precisely at a *time*, so your day can be managed right down to your needs.

#### Sequential and Parallel Projects!
Some tasks can't really be done without others before it being done first, and we understand that. Tasks blocked in a sequential project could be hidden if needed, and shown again when ready.

#### Filters and Perspectives
Filter tasks by tag? Check. Filter by projects? Check. Filter by due date? Check. Filter by due date and project with tags and sort tasks based on defer date while hiding eveything that's not avaliable? You bet.

## The Team
We are Shabang, a software development company aiming to design innovative solutions for interesting issues with fun and creative products.

We happen also to be a group of students from the silicon valley wanting to make this world slightly better with technology.

## Developing Building
Thanks for developing with us! Our preferred package manager is [yarn](https://yarnpkg.com/). If you don't know what that is, teach yourself the ways of the [Soydev](https://www.urbandictionary.com/define.php?term=Soydev).

We assume here that you have `node` 12+ installed. If you don't, [do it](https://nodejs.org/en/). When we use `$ROOT` in these docs, we mean the root of the repository.

### First, a quick note on cloning.

Begin by cloning the project at [https://github.com/Shabang-Systems/Condution](https://github.com/Shabang-Systems/Condution). 

The default branch should be the main development branch, and the branch `master` is the currently released version.

**This package has ubmodules! When you clone, make sure to clone submodules along with it by either `git clone --recursive` or, after you clone, `git submodule init` then `git submodule update`.**

### Firebase Connection

After cloning the package (with Submodules!), you need to add a lovely file into `$ROOT/src/backend/` called `secrets.json`. It contains your Firebase key objects (to power the Engine), which you need to gather following [these instructions](https://firebase.google.com/docs/web/setup#config-object). Here's an example `secrets.json`:

```jsx
{
    "dbkeys": {
        "deploy": {
            "apiKey": "...",
            "authDomain": "...",
            ...
            "appId": "..."
        },
        "debug": {
            "apiKey": "...",
            "authDomain": "...",
            ...
            "appId": "..."
        }
    }
}
```

We use two different Firebase projects for debug and deploy respectively. If you are only debugging, no need to include a different set of keys for deploy.

### The Yarn CLI

`secrets.json` in, you are ready to Conduct (verb: to write Condution)! Get all of the necessary project dependencies by issuing the command `yarn` in `$ROOT`. Just `yarn`.

You probably also need the Ionic CLI tools, which you could install by running `npm install -g @ionic/cli`.

With everything installed, execute your favourite CLI command to get started!

```markdown
`yarn` \
   `ionic:dist` — builds optimized web version/build folder
   `ionic:runios` — runs the dev server + ios hooks
   `ionic:rundroid` — runs the dev server + android hooks
   `electron:run` — runs electrn hooks only. you need to start the dev server with any of :point_up_2:
```

The actual build command has not been written yet for v1.0, but it's probably going to be `yarn platform:build` or something to that effect.

Good luck! Let us know if you have any questions [on the Discord](https://discord.gg/3hS7yv3) or [in the issues](https://github.com/Shabang-Systems/Condution/issues).

## Contributing?
We love contributions! You are welcome to contribute, just keep in mind that we prefer 4 spaces over tabs.

## Thank you!
Thank you for supporting us on this project. We really hope that this will be something useful. 

***

Designed with :heart: and :green_salad: by #!/Shabang.
