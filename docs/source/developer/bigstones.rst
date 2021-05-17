**************************
Quickstart and Big Stones
**************************
.. note:: If this is your first time here, **don't glance over this**. Read this page out loud to your pet duck to ensure understanding!

A Boring Chapter of Concepts
============================
Condution's API follows an `Event Based <https://en.wikipedia.org/wiki/Event-driven_programming>`_ programming paradigm. We make heavy use of the `Async/Await syntax <https://basarat.gitbook.io/typescript/future-javascript/async-await>`_ of TypeScript in order to create fast and responsive hooks into live-editing enviroments. (Remember, :doc:`../guides/workspaces` exist!) So, if you don't know what those are, read the linked resources.

If you don't know how Condution (the app) works, please `try it <https://app.condution.com/>`_. Condution's API is much easier to explain after you know how the app itself works.

Ok. I am going to assume that you tried it, and now know basic concepts.

A Quick(ish)start
=============

1. Make yoself a package
-------------------------
Anything that you do with Condution's API will likely be presented as an `npm package <https://www.npmjs.com/>`_. So, it'd be helpful for you to make one of those to work in.

When we say something is "Stable", its tested against :code:`Node 14` and :code:`yarn 1.22`. If you don't know what those are, `install this <https://nodejs.org/en/>`_ `and this <https://nodejs.org/en/>`_, but you should really teach yourself `the ways of the soydev <https://www.urbandictionary.com/define.php?term=Soydev>`_. The documentation uses these tools in these versions as well.

Once you have installed these lovely tools, open yourself a terminal, make yourself a folder, change directory into it and type :code:`npm create`. Pay close attention to `package name` and `entry point` questions that NPM ask you — the former being the name of your intergration, and the latter being the file that you should be working in/launching your intergration from.

Make a file named :code:`index.js` or whatever you named your `entry point` to be in that same folder. Finally, type :code:`yarn add @condution/engine` to install Condution's engine API package to your package. Start working there.

2. Get yoself a context
------------------------
To start working with the Condution API, you will need a :code:`Context`. A :doc:`context` is a badge for authentication into Condution, and tells the API which servers ("Providers") you need to connect to.

Basically every Object/Widget function needs a Context to run, otherwise it won't know what/where to fetch.

For details, take a look at the article :doc:`context`. But, for the lethargic, here's a minimal MVP that sets up such a Context with a Firebase — the default storage option for Condution's GUI — connection.

.. code-block:: javascript

    # import the engine
    const Engine = require("@condution/engine")

.. toctree::
    :hidden:
    :maxdepth: 4

    context
.. .. function:: foo(x)
   ..:module: some.module.name

   ..Return a line of text input from the user.

.. .. class:: foo(x)

   ..Return a line of text input from the user.

   ..:param: hewo


